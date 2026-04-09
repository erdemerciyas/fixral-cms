import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import { logger } from '@/core/lib/logger';
import AdmZip from 'adm-zip';

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

function extractBackupData(buffer: Buffer): any {
    const isZip = buffer.length >= 4
        && buffer[0] === 0x50 && buffer[1] === 0x4b
        && buffer[2] === 0x03 && buffer[3] === 0x04;

    if (isZip) {
        const zip = new AdmZip(buffer);
        const jsonEntry = zip.getEntry('backup_data.json') || zip.getEntry('full_backup_data.json');
        if (!jsonEntry) {
            throw new Error('ZIP dosyasında backup_data.json bulunamadı');
        }
        const jsonStr = zip.readAsText(jsonEntry);
        return JSON.parse(jsonStr);
    }

    const text = buffer.toString('utf-8');
    return JSON.parse(text);
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const contentType = req.headers.get('content-type') || '';
        let body: any;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const file = formData.get('file') as File;
            if (!file) {
                return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
            }
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            body = extractBackupData(buffer);
        } else {
            body = await req.json();
        }

        if (!body.content || !body.version) {
            return NextResponse.json({ error: 'Geçersiz yedek dosyası formatı' }, { status: 400 });
        }

        await connectDB();

        const {
            news, siteSettings, portfolios, services,
            sliders, about, contact, footer, contentSettings,
            categories, videos,
            users, settings, messages, pageSettings
        } = body.content;

        const stats = {
            news: 0, portfolios: 0, services: 0,
            sliders: 0, categories: 0,
            users: 0, messages: 0, videos: 0,
            pageSettings: 0,
            siteSettings: 0, footer: 0, contentSettings: 0,
            about: 0, contact: 0, settings: 0,
            errors: 0
        };

        const importCollection = async (Model: any, items: any[], keyField: string, statKey: keyof typeof stats) => {
            if (!Array.isArray(items) || items.length === 0) return;

            for (const item of items) {
                try {
                    const { _id, __v, ...rest } = item;
                    const filter: any = {};

                    if (keyField === '_id') {
                        if (_id) filter._id = _id;
                        else continue;
                    } else if (item[keyField]) {
                        filter[keyField] = item[keyField];
                    } else if (_id) {
                        filter._id = _id;
                    } else {
                        continue;
                    }

                    const updateOps: any = { $set: rest };
                    if (_id) {
                        updateOps['$setOnInsert'] = { _id };
                    }

                    await Model.updateOne(filter, updateOps, { upsert: true });
                    (stats as any)[statKey]++;
                } catch (e) {
                    stats.errors++;
                    logger.warn(`Failed to import ${statKey} item`, 'BACKUP', { error: e });
                }
            }
        };

        const importSingleton = async (Model: any, items: any[], statKey: keyof typeof stats) => {
            if (!Array.isArray(items) || items.length === 0) return;
            try {
                const { _id, __v, ...rest } = items[0];
                await Model.updateOne({}, { $set: rest }, { upsert: true });
                (stats as any)[statKey]++;
            } catch (e) {
                stats.errors++;
                logger.warn(`Failed to import ${statKey}`, 'BACKUP', { error: e });
            }
        };

        await importCollection(News, news, 'slug', 'news');
        await importCollection(Portfolio, portfolios, 'slug', 'portfolios');
        await importCollection(Category, categories, 'slug', 'categories');
        await importCollection(PageSetting, pageSettings, 'pageId', 'pageSettings');
        await importCollection(User, users, 'email', 'users');

        await importCollection(Service, services, '_id', 'services');
        await importCollection(Slider, sliders, '_id', 'sliders');
        await importCollection(Video, videos, '_id', 'videos');
        await importCollection(Message, messages, '_id', 'messages');

        await importSingleton(SiteSettings, siteSettings, 'siteSettings');
        await importSingleton(FooterSettings, footer, 'footer');
        await importSingleton(ContentSettings, contentSettings, 'contentSettings');
        await importSingleton(Settings, settings, 'settings');
        await importSingleton(About, about, 'about');
        await importSingleton(Contact, contact, 'contact');

        logger.info('Full Import completed', 'BACKUP', { stats });

        const totalImported = Object.entries(stats)
            .filter(([key]) => key !== 'errors')
            .reduce((sum, [, val]) => sum + val, 0);

        return NextResponse.json({
            success: true,
            message: `İçe aktarma tamamlandı. ${totalImported} kayıt işlendi${stats.errors > 0 ? `, ${stats.errors} hata` : ''}.`,
            stats
        });

    } catch (error) {
        logger.error('Import failed', 'BACKUP', { error });
        const msg = error instanceof Error ? error.message : 'İçe aktarma başarısız';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
