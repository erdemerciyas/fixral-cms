import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdmZip from 'adm-zip';
import { logger } from '@/core/lib/logger';
import { prisma } from '@/lib/prisma';
import {
    listAllCloudinaryResources,
    isCloudinaryConfigured,
    type BackupCloudinaryResource,
} from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

async function downloadFile(url: string): Promise<Buffer | null> {
    try {
        if (!url || !url.startsWith('http')) return null;
        const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (!res.ok) return null;
        return Buffer.from(await res.arrayBuffer());
    } catch {
        return null;
    }
}

// public_id klasör yapısını koruyarak ZIP içi güvenli dosya yolu üretir
function mediaZipPath(resource: BackupCloudinaryResource): string {
    const safeId = resource.public_id.replace(/[^a-zA-Z0-9/_.-]/g, '_');
    const ext = resource.format ? `.${resource.format}` : '';
    // raw dosyalarda public_id genellikle uzantıyı zaten içerir
    const needsExt = ext && !safeId.toLowerCase().endsWith(ext.toLowerCase());
    return `media/${resource.resource_type}/${safeId}${needsExt ? ext : ''}`;
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const includeMedia = searchParams.get('includeMedia') !== 'false';

        // Tüm Prisma modelleri — komple DB yedeği (19 tablo)
        const [
            news, siteSettings, portfolios, services,
            sliders, about, contact, footer, contentSettings,
            categories, videos, users, settings, messages, pageSettings,
            pageSettingsKV, pageTemplates, languages, models3D,
        ] = await Promise.all([
            prisma.newsRow.findMany(),
            prisma.siteSettingsRow.findMany(),
            prisma.portfolioRow.findMany(),
            prisma.serviceRow.findMany(),
            prisma.sliderRow.findMany(),
            prisma.aboutRow.findMany(),
            prisma.contactRow.findMany(),
            prisma.footerSettingsRow.findMany(),
            prisma.contentSettingRow.findMany(),
            prisma.categoryRow.findMany(),
            prisma.videoRow.findMany(),
            prisma.userRow.findMany(), // parola hash'i dahil — restore için gerekli
            prisma.settingRow.findMany(),
            prisma.messageRow.findMany(),
            prisma.pageSettingRow.findMany(),
            prisma.pageSettingsRow.findMany(),
            prisma.pageTemplateRow.findMany(),
            prisma.languageRow.findMany(),
            prisma.model3DRow.findMany(),
        ]);

        const backupData = {
            version: '3.0',
            timestamp: new Date().toISOString(),
            source: process.env.NEXTAUTH_URL,
            content: {
                news, siteSettings, portfolios, services,
                sliders, about, contact, footer, contentSettings,
                categories, videos, users, settings, messages, pageSettings,
                pageSettingsKV, pageTemplates, languages, models3D,
            }
        };

        const zip = new AdmZip();

        zip.addFile('backup_data.json', Buffer.from(JSON.stringify(backupData, null, 2)));

        if (includeMedia) {
            if (!isCloudinaryConfigured()) {
                logger.warn('Cloudinary not configured, skipping media backup', 'BACKUP');
            } else {
                // Cloudinary hesabındaki TÜM varlıkları listele (image + video + raw)
                const resourceTypes: Array<'image' | 'video' | 'raw'> = ['image', 'video', 'raw'];
                const settled = await Promise.allSettled(
                    resourceTypes.map((type) => listAllCloudinaryResources(type))
                );

                const resources: BackupCloudinaryResource[] = [];
                settled.forEach((result, idx) => {
                    if (result.status === 'fulfilled') {
                        resources.push(...result.value);
                    } else {
                        logger.warn('Cloudinary listing failed for resource type', 'BACKUP', {
                            resourceType: resourceTypes[idx],
                            error: result.reason,
                        });
                    }
                });

                const manifestFiles: Array<{
                    publicId: string;
                    resourceType: string;
                    format?: string;
                    bytes: number;
                    zipPath: string;
                    downloaded: boolean;
                }> = [];

                const BATCH_SIZE = 5;
                for (let i = 0; i < resources.length; i += BATCH_SIZE) {
                    const batch = resources.slice(i, i + BATCH_SIZE);
                    await Promise.allSettled(
                        batch.map(async (resource) => {
                            const zipPath = mediaZipPath(resource);
                            const buffer = await downloadFile(resource.secure_url);
                            if (buffer) {
                                zip.addFile(zipPath, buffer);
                            } else {
                                logger.warn('Failed to download media for backup', 'BACKUP', {
                                    publicId: resource.public_id,
                                    url: resource.secure_url,
                                });
                            }
                            manifestFiles.push({
                                publicId: resource.public_id,
                                resourceType: resource.resource_type,
                                format: resource.format,
                                bytes: resource.bytes,
                                zipPath,
                                downloaded: Boolean(buffer),
                            });
                        })
                    );
                }

                const manifest = {
                    version: '3.0',
                    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
                    totalMedia: manifestFiles.length,
                    downloaded: manifestFiles.filter(f => f.downloaded).length,
                    files: manifestFiles,
                };
                zip.addFile('media_manifest.json', Buffer.from(JSON.stringify(manifest, null, 2)));

                logger.info('Media backup completed', 'BACKUP', {
                    total: manifestFiles.length,
                    downloaded: manifest.downloaded,
                });
            }
        }

        const zipBuffer = zip.toBuffer();

        return new NextResponse(zipBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Length': zipBuffer.length.toString(),
                'Content-Disposition': `attachment; filename="site-backup-${new Date().toISOString().split('T')[0]}.zip"`,
            },
        });

    } catch (error) {
        logger.error('Export failed', 'BACKUP', { error });
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
