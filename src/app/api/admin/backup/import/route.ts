import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logger } from '@/core/lib/logger';
import AdmZip from 'adm-zip';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { uploadBufferToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/* ------------------------------------------------------------------ */
/*  Yardımcılar                                                        */
/* ------------------------------------------------------------------ */

// Prisma model alan whitelist'i — eski yedeklerdeki fazla/uyumsuz alanları ayıklar
const MODEL_FIELDS = new Map<string, Set<string>>(
    Prisma.dmmf.datamodel.models.map((m) => [
        m.name,
        new Set(m.fields.filter((f) => f.kind === 'scalar' || f.kind === 'enum').map((f) => f.name)),
    ])
);

// Kaydı Prisma şemasına uygun hale getirir: bilinmeyen alanları ve
// Mongoose kalıntılarını (_id, __v) atar; updatedAt'i Prisma yönetir
function sanitize(item: Record<string, any>, modelName: string): Record<string, any> {
    const fields = MODEL_FIELDS.get(modelName);
    const data: Record<string, any> = {};
    if (!fields) return data;
    for (const [key, value] of Object.entries(item)) {
        if (!fields.has(key) || key === 'updatedAt') continue;
        data[key] = value;
    }
    // Eski v2 yedeklerinde id yerine sadece _id olabilir
    if (!data.id && typeof item._id === 'string') data.id = item._id;
    return data;
}

function isZipBuffer(buffer: Buffer): boolean {
    return buffer.length >= 4
        && buffer[0] === 0x50 && buffer[1] === 0x4b
        && buffer[2] === 0x03 && buffer[3] === 0x04;
}

/* ------------------------------------------------------------------ */
/*  Route                                                              */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const contentType = req.headers.get('content-type') || '';
        let body: any;
        let zip: AdmZip | null = null;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const file = formData.get('file') as File;
            if (!file) {
                return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
            }
            const buffer = Buffer.from(await file.arrayBuffer());

            if (isZipBuffer(buffer)) {
                zip = new AdmZip(buffer);
                const jsonEntry = zip.getEntry('backup_data.json') || zip.getEntry('full_backup_data.json');
                if (!jsonEntry) {
                    throw new Error('ZIP dosyasında backup_data.json bulunamadı');
                }
                body = JSON.parse(zip.readAsText(jsonEntry));
            } else {
                body = JSON.parse(buffer.toString('utf-8'));
            }
        } else {
            body = await req.json();
        }

        if (!body.content || !body.version) {
            return NextResponse.json({ error: 'Geçersiz yedek dosyası formatı' }, { status: 400 });
        }

        const {
            news, siteSettings, portfolios, services,
            sliders, about, contact, footer, contentSettings,
            categories, videos, users, settings, messages, pageSettings,
            pageSettingsKV, pageTemplates, languages, models3D,
        } = body.content;

        const stats: Record<string, number> = {
            news: 0, portfolios: 0, services: 0,
            sliders: 0, categories: 0,
            users: 0, messages: 0, videos: 0,
            pageSettings: 0, pageSettingsKV: 0,
            pageTemplates: 0, languages: 0, models3D: 0,
            siteSettings: 0, footer: 0, contentSettings: 0,
            about: 0, contact: 0, settings: 0,
            media: 0,
            skipped: 0, errors: 0,
        };

        // Benzersiz doğal anahtar (slug/email/key...) üzerinden gerçek Prisma upsert
        const importByKey = async (
            delegate: any, modelName: string, items: any[],
            keyField: string, statKey: string
        ) => {
            if (!Array.isArray(items) || items.length === 0) return;
            for (const item of items) {
                try {
                    const data = sanitize(item, modelName);
                    const { id, ...rest } = data;
                    const keyValue = data[keyField];

                    if (keyValue !== undefined && keyValue !== null && keyValue !== '') {
                        await delegate.upsert({
                            where: { [keyField]: keyValue },
                            update: rest,
                            create: data,
                        });
                    } else if (id) {
                        await delegate.upsert({
                            where: { id },
                            update: rest,
                            create: data,
                        });
                    } else {
                        stats.skipped++;
                        continue;
                    }
                    stats[statKey]++;
                } catch (e) {
                    stats.errors++;
                    logger.warn(`Failed to import ${statKey} item`, 'BACKUP', { error: e });
                }
            }
        };

        // id bazlı upsert (slider, mesaj gibi doğal anahtarı olmayan kayıtlar)
        const importById = async (
            delegate: any, modelName: string, items: any[], statKey: string
        ) => {
            if (!Array.isArray(items) || items.length === 0) return;
            for (const item of items) {
                try {
                    const data = sanitize(item, modelName);
                    const { id, ...rest } = data;
                    if (id) {
                        await delegate.upsert({ where: { id }, update: rest, create: data });
                    } else {
                        await delegate.create({ data: rest });
                    }
                    stats[statKey]++;
                } catch (e) {
                    stats.errors++;
                    logger.warn(`Failed to import ${statKey} item`, 'BACKUP', { error: e });
                }
            }
        };

        // Singleton: mevcut ilk kayıt güncellenir, yoksa oluşturulur
        const importSingleton = async (
            delegate: any, modelName: string, items: any[], statKey: string
        ) => {
            if (!Array.isArray(items) || items.length === 0) return;
            try {
                const data = sanitize(items[0], modelName);
                const rest = { ...data };
                delete rest.id;
                const existing = await delegate.findFirst({ select: { id: true } });
                if (existing) {
                    await delegate.update({ where: { id: existing.id }, data: rest });
                } else {
                    await delegate.create({ data });
                }
                stats[statKey]++;
            } catch (e) {
                stats.errors++;
                logger.warn(`Failed to import ${statKey}`, 'BACKUP', { error: e });
            }
        };

        // Kullanıcılar: parolasız (eski v2 yedeği) yeni kullanıcı OLUŞTURULAMAZ
        const importUsers = async (items: any[]) => {
            if (!Array.isArray(items) || items.length === 0) return;
            for (const item of items) {
                try {
                    const data = sanitize(item, 'UserRow');
                    const password = data.password;
                    const rest = { ...data };
                    delete rest.id;
                    delete rest.password;
                    if (!data.email) { stats.skipped++; continue; }

                    const existing = await prisma.userRow.findUnique({ where: { email: data.email } });
                    if (existing) {
                        // Parola yedekte varsa güncelle, yoksa mevcut hash korunur
                        await prisma.userRow.update({
                            where: { email: data.email },
                            data: password ? { ...rest, password } : rest,
                        });
                        stats.users++;
                    } else if (password) {
                        await prisma.userRow.create({ data: data as Prisma.UserRowUncheckedCreateInput });
                        stats.users++;
                    } else {
                        stats.skipped++;
                        logger.warn('User skipped: backup has no password hash', 'BACKUP', { email: data.email });
                    }
                } catch (e) {
                    stats.errors++;
                    logger.warn('Failed to import user', 'BACKUP', { error: e });
                }
            }
        };

        // ── Veritabanı geri yükleme ──
        await importByKey(prisma.categoryRow, 'CategoryRow', categories, 'slug', 'categories');
        await importByKey(prisma.newsRow, 'NewsRow', news, 'slug', 'news');
        await importByKey(prisma.portfolioRow, 'PortfolioRow', portfolios, 'slug', 'portfolios');
        await importByKey(prisma.serviceRow, 'ServiceRow', services, 'slug', 'services');
        await importByKey(prisma.pageSettingRow, 'PageSettingRow', pageSettings, 'pageId', 'pageSettings');
        await importByKey(prisma.pageSettingsRow, 'PageSettingsRow', pageSettingsKV, 'key', 'pageSettingsKV');
        await importByKey(prisma.pageTemplateRow, 'PageTemplateRow', pageTemplates, 'slug', 'pageTemplates');
        await importByKey(prisma.languageRow, 'LanguageRow', languages, 'code', 'languages');
        await importByKey(prisma.videoRow, 'VideoRow', videos, 'videoId', 'videos');
        await importByKey(prisma.settingRow, 'SettingRow', settings, 'key', 'settings');
        await importByKey(prisma.contentSettingRow, 'ContentSettingRow', contentSettings, 'key', 'contentSettings');
        await importUsers(users);

        await importById(prisma.sliderRow, 'SliderRow', sliders, 'sliders');
        await importById(prisma.messageRow, 'MessageRow', messages, 'messages');
        await importById(prisma.contactRow, 'ContactRow', contact, 'contact');
        await importById(prisma.model3DRow, 'Model3DRow', models3D, 'models3D');

        await importSingleton(prisma.siteSettingsRow, 'SiteSettingsRow', siteSettings, 'siteSettings');
        await importSingleton(prisma.footerSettingsRow, 'FooterSettingsRow', footer, 'footer');
        await importSingleton(prisma.aboutRow, 'AboutRow', about, 'about');

        // ── Medya geri yükleme (ZIP içindeki media/ dosyaları Cloudinary'ye) ──
        if (zip) {
            const manifestEntry = zip.getEntry('media_manifest.json');
            if (manifestEntry && isCloudinaryConfigured()) {
                try {
                    const manifest = JSON.parse(zip.readAsText(manifestEntry));
                    const files: any[] = Array.isArray(manifest.files) ? manifest.files : [];
                    // Sadece v3 manifest'leri publicId içerir; eski format atlanır
                    const restorable = files.filter(
                        (f) => f && typeof f === 'object' && f.publicId && f.zipPath && f.downloaded !== false
                    );

                    const BATCH_SIZE = 3;
                    for (let i = 0; i < restorable.length; i += BATCH_SIZE) {
                        const batch = restorable.slice(i, i + BATCH_SIZE);
                        await Promise.allSettled(
                            batch.map(async (file) => {
                                const entry = zip!.getEntry(file.zipPath);
                                if (!entry) { stats.skipped++; return; }
                                try {
                                    await uploadBufferToCloudinary(
                                        entry.getData(),
                                        file.publicId,
                                        file.resourceType === 'video' || file.resourceType === 'raw'
                                            ? file.resourceType
                                            : 'image'
                                    );
                                    stats.media++;
                                } catch (e) {
                                    stats.errors++;
                                    logger.warn('Failed to restore media to Cloudinary', 'BACKUP', {
                                        publicId: file.publicId, error: e,
                                    });
                                }
                            })
                        );
                    }
                } catch (e) {
                    stats.errors++;
                    logger.warn('Media manifest could not be processed', 'BACKUP', { error: e });
                }
            } else if (manifestEntry && !isCloudinaryConfigured()) {
                logger.warn('Cloudinary not configured, media restore skipped', 'BACKUP');
            }
        }

        logger.info('Full Import completed', 'BACKUP', { stats });

        const totalImported = Object.entries(stats)
            .filter(([key]) => key !== 'errors' && key !== 'skipped' && key !== 'media')
            .reduce((sum, [, val]) => sum + val, 0);

        const parts = [`${totalImported} kayıt işlendi`];
        if (stats.media > 0) parts.push(`${stats.media} medya dosyası geri yüklendi`);
        if (stats.skipped > 0) parts.push(`${stats.skipped} kayıt atlandı`);
        if (stats.errors > 0) parts.push(`${stats.errors} hata`);

        return NextResponse.json({
            success: true,
            message: `İçe aktarma tamamlandı. ${parts.join(', ')}.`,
            stats
        });

    } catch (error) {
        logger.error('Import failed', 'BACKUP', { error });
        const msg = error instanceof Error ? error.message : 'İçe aktarma başarısız';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
