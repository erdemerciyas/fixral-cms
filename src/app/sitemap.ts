import { MetadataRoute } from 'next';
import News from '../models/News';
import Portfolio from '../models/Portfolio';
import { SITE_URL } from '../lib/seo-utils';
import { getFxData } from '../lib/fx-data-server';
import { visibleSoftware } from '../content/fx-data';
import { getFx3dModels } from '../lib/cults3d';

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = SITE_URL;

    // Statik sayfalar (site tek dilli: /tr)
    const staticPages: MetadataRoute.Sitemap = [
        // Anasayfa
        { url: `${baseUrl}/tr`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },

        // İletişim
        { url: `${baseUrl}/tr/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },

        // Hizmetler
        { url: `${baseUrl}/tr/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },

        // Portfolyo
        { url: `${baseUrl}/tr/portfolio`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },

        // Haberler
        { url: `${baseUrl}/tr/haberler`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },

        // Yazılımlar
        { url: `${baseUrl}/tr/software`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },

        // Videolar
        { url: `${baseUrl}/tr/videos`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/tr/fx-3d`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ];

    const dynamicUrls: MetadataRoute.Sitemap = [];

    try {
        // Hizmet ve yazılım detayları (panel + katalog)
        const fx = await getFxData();
        fx.services.forEach((s) => {
            dynamicUrls.push(
                { url: `${baseUrl}/tr/services/${s.slug}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 }
            );
        });
        visibleSoftware(fx.software).forEach((sw) => {
            dynamicUrls.push(
                { url: `${baseUrl}/tr/software/${sw.slug}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 }
            );
        });
    } catch (error) {
        console.error('Sitemap hizmet/yazılım URL\'leri oluşturulurken hata:', error);
    }

    try {
        // FX 3D model detayları (Cults3D)
        (await getFx3dModels('tr')).forEach((m) => {
            const lastModified = m.publishedAt ? new Date(m.publishedAt) : new Date();
            dynamicUrls.push(
                { url: `${baseUrl}/tr/fx-3d/${m.slug}`, lastModified, changeFrequency: 'monthly', priority: 0.6 }
            );
        });
    } catch (error) {
        console.error('Sitemap FX 3D URL\'leri oluşturulurken hata:', error);
    }

    try {
        // Haber / Makale URL'leri (/tr/haberler)
        const newsItems = await News.find({ status: 'published' }).select('slug updatedAt createdAt').lean();
        newsItems.forEach((post: any) => {
            const lastModified = post.updatedAt || post.createdAt || new Date();
            dynamicUrls.push(
                { url: `${baseUrl}/tr/haberler/${post.slug}`, lastModified, changeFrequency: 'weekly', priority: 0.7 }
            );
        });

        // Portfolyo URL'leri
        const portfolios = await Portfolio.find({ isActive: true }).select('slug updatedAt createdAt').lean();
        portfolios.forEach((portfolio: any) => {
            const lastModified = portfolio.updatedAt || portfolio.createdAt || new Date();
            dynamicUrls.push(
                { url: `${baseUrl}/tr/portfolio/${portfolio.slug}`, lastModified, changeFrequency: 'monthly', priority: 0.6 }
            );
        });

    } catch (error) {
        console.error('Sitemap dinamik URL\'leri oluşturulurken hata:', error);
    }

    return [...staticPages, ...dynamicUrls];
}
