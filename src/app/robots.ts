import { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/seo-utils';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            // trailingSlash: false — yollar eğik çizgisiz yazılır (önek eşleşmesi alt yolları da kapsar)
            disallow: [
                '/admin',
                '/api/',
                '/tr/account',
                '/tr/login',
                '/tr/register',
                '/tr/offline',
            ],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
