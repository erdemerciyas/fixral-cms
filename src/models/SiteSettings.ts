import { createPrismaModel } from '@/lib/prisma-model-adapter';
import { prisma } from '@/lib/prisma';
import { defaultSiteSettings } from '@/models/_factory';

interface ISiteSettings {
  logo: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  siteName: string;
  logoText: string;
  slogan: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  socialMedia: {
    linkedin: string;
    twitter: string;
    github: string;
    instagram: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  siteUrl: string;
  timezone: string;
  language: string;
  favicon: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  enableComments: boolean;
  analytics: {
    googleAnalyticsId: string;
    googleTagManagerId: string;
    googleSiteVerification: string;
    enableAnalytics: boolean;
  };
  system: {
    maxUploadSize: number;
  };
  themeConfig: IThemeConfig;
  seoConfig: ISeoConfig;
  analyticsConfig: IAnalyticsConfig;
  socialMediaConfig: ISocialMediaConfig;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IThemeConfig {
  [key: string]: any;
  colors: Record<string, any>;
  layout: Record<string, any>;
  features: Record<string, any>;
}

interface ISeoConfig {
  metaTitleSuffix: string;
  globalMetaDescription: string;
  globalKeywords: string[];
  enableSchemaMarkup: boolean;
  enableOpenGraph: boolean;
  enableTwitterCards: boolean;
}

interface IAnalyticsConfig {
  googleAnalyticsId: string;
  googleTagManagerId: string;
  googleSiteVerification: string;
  enablePageViewTracking: boolean;
}

interface ISocialMediaConfig {
  twitter: string;
  instagram: string;
  linkedin: string;
  github: string;
  facebook: string;
  youtube: string;
  enableSharing: boolean;
  showShareCount: boolean;
}

const SiteSettings: any = createPrismaModel('SiteSettings', prisma.siteSettingsRow, {
  async getSiteSettings() {
    const current = await SiteSettings.findOne({ isActive: true });
    if (current) return current;
    return SiteSettings.create(defaultSiteSettings);
  },
  async updateSiteSettings(updateData: Partial<ISiteSettings>) {
    return SiteSettings.findOneAndUpdate(
      { isActive: true },
      { $set: updateData },
      { upsert: true, new: true }
    );
  },
});

export default SiteSettings;
export type { ISiteSettings, IThemeConfig, ISeoConfig, IAnalyticsConfig, ISocialMediaConfig };
