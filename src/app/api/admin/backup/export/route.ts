import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import archiver from 'archiver';
import { logger } from '@/core/lib/logger';

import News from '@/models/News';
import SiteSettings from '@/models/SiteSettings';
import Portfolio from '@/models/Portfolio';
import Service from '@/models/Service';
import Slider from '@/models/Slider';
import About from '@/models/About';
import Contact from '@/models/Contact';
import FooterSettings from '@/models/FooterSettings';
import ContentSettings from '@/models/ContentSettings';
import Category from '@/models/Category';
import Video from '@/models/Video';
import User from '@/models/User';
import Settings from '@/models/Settings';
import Message from '@/models/Message';
import PageSetting from '@/models/PageSetting';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

async function downloadFile(url: string): Promise<Buffer | null> {
    try {
        if (!url || !url.startsWith('http')) return null;
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) return null;
        return Buffer.from(await res.arrayBuffer());
    } catch {
        return null;
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const includeMedia = searchParams.get('includeMedia') !== 'false';

        await connectDB();

        const [
            news, siteSettings, portfolios, services,
            sliders, about, contact, footer, contentSettings,
            categories, videos, users, settings, messages, pageSettings
        ] = await Promise.all([
            News.find({}).lean(),
            SiteSettings.find({}).lean(),
            Portfolio.find({}).lean(),
            Service.find({}).lean(),
            Slider.find({}).lean(),
            About.find({}).lean(),
            Contact.find({}).lean(),
            FooterSettings.find({}).lean(),
            ContentSettings.find({}).lean(),
            Category.find({}).lean(),
            Video.find({}).lean(),
            User.find({}).select('-password').lean(),
            Settings.find({}).lean(),
            Message.find({}).lean(),
            PageSetting.find({}).lean()
        ]);

        const backupData = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            source: process.env.NEXTAUTH_URL,
            content: {
                news, siteSettings, portfolios, services,
                sliders, about, contact, footer, contentSettings,
                categories, videos, users, settings, messages, pageSettings
            }
        };

        const archive = archiver('zip', { zlib: { level: 5 } });
        const chunks: Uint8Array[] = [];

        archive.on('data', (chunk: Buffer) => chunks.push(new Uint8Array(chunk)));

        const archiveFinished = new Promise<Buffer>((resolve, reject) => {
            archive.on('end', () => resolve(Buffer.concat(chunks)));
            archive.on('error', reject);
        });

        archive.append(JSON.stringify(backupData, null, 2), { name: 'backup_data.json' });

        if (includeMedia) {
            const mediaFiles: { url: string; name: string }[] = [];
            const seenUrls = new Set<string>();

            const addMedia = (url: string | undefined, prefix: string, slugOrId: string) => {
                if (!url || !url.startsWith('http') || seenUrls.has(url)) return;
                const cleanUrl = url.split('?')[0];
                const ext = cleanUrl.split('.').pop() || 'jpg';
                const safeSlug = slugOrId.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                mediaFiles.push({ url, name: `media/${prefix}/${safeSlug}.${ext}` });
                seenUrls.add(url);
            };

            siteSettings.forEach((s: any) => {
                if (s.logo?.url) addMedia(s.logo.url, 'site', 'logo');
                if (s.favicon?.url) addMedia(s.favicon.url, 'site', 'favicon');
            });

            news.forEach((item: any) => {
                if (item.featuredImage?.url) addMedia(item.featuredImage.url, 'news', `${item.slug || item._id}-featured`);
                if (item.image) addMedia(item.image, 'news', `${item.slug || item._id}-image`);
            });

            portfolios.forEach((item: any) => {
                if (item.coverImage) addMedia(item.coverImage, 'portfolio', `${item.slug || item._id}-cover`);
                if (Array.isArray(item.images)) {
                    item.images.forEach((img: any, idx: number) => {
                        const url = typeof img === 'string' ? img : img?.url;
                        addMedia(url, 'portfolio', `${item.slug || item._id}-img-${idx}`);
                    });
                }
            });

            services.forEach((item: any) => {
                if (item.icon) addMedia(item.icon, 'services', `${item.slug || item._id}-icon`);
                if (item.image) addMedia(item.image, 'services', `${item.slug || item._id}-image`);
            });

            sliders.forEach((slider: any) => {
                if (Array.isArray(slider.items)) {
                    slider.items.forEach((item: any, idx: number) => {
                        if (item.image) addMedia(item.image, 'sliders', `${slider._id}-slide-${idx}`);
                        if (item.mobileImage) addMedia(item.mobileImage, 'sliders', `${slider._id}-slide-mob-${idx}`);
                    });
                }
            });

            about.forEach((item: any) => {
                if (item.image) addMedia(item.image, 'about', 'main-image');
                if (Array.isArray(item.gallery)) {
                    item.gallery.forEach((url: string, idx: number) => addMedia(url, 'about', `gallery-${idx}`));
                }
            });

            videos.forEach((item: any) => {
                if (item.thumbnail) addMedia(item.thumbnail, 'videos', `${item._id}-thumb`);
            });

            const BATCH_SIZE = 5;
            for (let i = 0; i < mediaFiles.length; i += BATCH_SIZE) {
                const batch = mediaFiles.slice(i, i + BATCH_SIZE);
                const results = await Promise.allSettled(
                    batch.map(async (file) => {
                        const buffer = await downloadFile(file.url);
                        if (buffer) {
                            archive.append(buffer, { name: file.name });
                        }
                    })
                );
                results.forEach((r, idx) => {
                    if (r.status === 'rejected') {
                        logger.warn('Failed to download media for backup', 'BACKUP', {
                            file: batch[idx].name,
                            url: batch[idx].url,
                        });
                    }
                });
            }

            const manifest = {
                totalMedia: mediaFiles.length,
                files: mediaFiles.map(f => f.name),
            };
            archive.append(JSON.stringify(manifest, null, 2), { name: 'media_manifest.json' });
        }

        archive.finalize();
        const zipBuffer = await archiveFinished;

        return new NextResponse(zipBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Length': zipBuffer.length.toString(),
                'Content-Disposition': `attachment; filename="fixral-backup-${new Date().toISOString().split('T')[0]}.zip"`,
            },
        });

    } catch (error) {
        logger.error('Export failed', 'BACKUP', { error });
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
