import { createPrismaModel } from '@/lib/prisma-model-adapter';
import { prisma } from '@/lib/prisma';
import { defaultFooterSettings } from '@/models/_factory';

interface IFooterSettings {
  mainDescription: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  quickLinks: {
    title: string;
    url: string;
    isExternal: boolean;
  }[];
  socialLinks: {
    linkedin: string;
    twitter: string;
    instagram: string;
    facebook: string;
    github: string;
    youtube: string;
  };
}

const FooterSettings: any = createPrismaModel('FooterSettings', prisma.footerSettingsRow, {
  async getSingleton() {
    const existing = await FooterSettings.findOne();
    if (existing) {
      // If quickLinks is empty/missing, merge defaults so footer links appear
      if (!existing.quickLinks || (Array.isArray(existing.quickLinks) && existing.quickLinks.length === 0)) {
        const updated = await FooterSettings.findOneAndUpdate(
          { _id: existing._id },
          { quickLinks: defaultFooterSettings.quickLinks },
          { new: true }
        );
        return updated || existing;
      }
      return existing;
    }
    return FooterSettings.create(defaultFooterSettings);
  },
});

export default FooterSettings;
