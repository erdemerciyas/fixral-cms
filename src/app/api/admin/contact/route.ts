import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import SiteSettings from '@/models/SiteSettings';
import { withSecurity, SecurityConfigs } from '@/lib/security-middleware';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withSecurity(SecurityConfigs.admin)(async () => {
  try {
    await connectDB();

    const siteSettings = await SiteSettings.getSiteSettings();
    const socialMediaConfig = siteSettings.socialMediaConfig || {};

    const contactData = {
      email: siteSettings.contact?.email || '',
      phone: siteSettings.contact?.phone || '',
      address: siteSettings.contact?.address || '',
      socialLinks: {
        twitter: socialMediaConfig.twitter || siteSettings.socialMedia?.twitter || '',
        facebook: socialMediaConfig.facebook || '',
        linkedin: socialMediaConfig.linkedin || siteSettings.socialMedia?.linkedin || '',
        instagram: socialMediaConfig.instagram || siteSettings.socialMedia?.instagram || '',
      },
    };

    return NextResponse.json(contactData, { status: 200 });
  } catch (error) {
    console.error('Contact settings fetch error:', error);
    return NextResponse.json(
      { error: 'İletişim ayarları getirilemedi' },
      { status: 500 }
    );
  }
});

export const POST = withSecurity(SecurityConfigs.admin)(async (request: NextRequest) => {
  try {
    await connectDB();

    const body = await request.json();
    const { email, phone, address, socialLinks } = body;

    if (!email || !phone || !address) {
      return NextResponse.json(
        { error: 'E-posta, telefon ve adres alanları zorunludur' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      contact: { email, phone, address },
    };

    if (socialLinks) {
      const currentSettings = await SiteSettings.getSiteSettings();
      const existingSocialMediaConfig = currentSettings.socialMediaConfig || {};

      updateData.socialMediaConfig = {
        ...existingSocialMediaConfig,
        twitter: socialLinks.twitter ?? existingSocialMediaConfig.twitter ?? '',
        facebook: socialLinks.facebook ?? existingSocialMediaConfig.facebook ?? '',
        linkedin: socialLinks.linkedin ?? existingSocialMediaConfig.linkedin ?? '',
        instagram: socialLinks.instagram ?? existingSocialMediaConfig.instagram ?? '',
      };

      updateData.socialMedia = {
        ...(currentSettings.socialMedia || {}),
        twitter: socialLinks.twitter ?? currentSettings.socialMedia?.twitter ?? '',
        linkedin: socialLinks.linkedin ?? currentSettings.socialMedia?.linkedin ?? '',
        instagram: socialLinks.instagram ?? currentSettings.socialMedia?.instagram ?? '',
      };
    }

    const settings = await SiteSettings.updateSiteSettings(updateData);

    return NextResponse.json(
      { message: 'İletişim ayarları başarıyla güncellendi', settings },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact settings update error:', error);
    return NextResponse.json(
      { error: 'İletişim ayarları güncellenemedi' },
      { status: 500 }
    );
  }
});
