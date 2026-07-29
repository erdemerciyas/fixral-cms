import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import SiteSettings from '@/models/SiteSettings';

/**
 * Site ayarlarını hem istek içinde (React cache) hem istekler arasında
 * (unstable_cache, 60 sn) önbellekler. Root layout'un generateMetadata ve
 * RootLayout gövdesi aynı isteği paylaşır; çoğu istekte DB sorgusu çıkmaz.
 *
 * Admin site-settings güncellemesi `revalidateTag('site-settings')` ile
 * önbelleği anında tazeler.
 */
export const getCachedSiteSettings = cache(
  unstable_cache(
    async () => SiteSettings.getSiteSettings(),
    ['site-settings'],
    { revalidate: 60, tags: ['site-settings'] }
  )
);
