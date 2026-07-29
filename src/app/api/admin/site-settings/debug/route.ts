import { NextResponse } from 'next/server';
import SiteSettings from '../../../../../models/SiteSettings';
import Settings from '../../../../../models/Settings';

// GET: Debug için mevcut verileri kontrol et
export async function GET() {
  try {
    // SiteSettings verilerini al
    const siteSettings = await SiteSettings.findOne({ isActive: true });
    
    // Settings verilerini al
    const settings = await Settings.findOne({ isActive: true });
    
    console.log('🔍 Debug - SiteSettings:', {
      found: !!siteSettings,
      logo: siteSettings?.logo,
      siteName: siteSettings?.siteName,
      fullData: siteSettings
    });
    
    console.log('🔍 Debug - Settings:', {
      found: !!settings,
      logo: settings?.logo,
      siteName: settings?.siteName
    });
    
    return NextResponse.json({
      siteSettings: siteSettings || null,
      settings: settings ? {
        logo: settings.logo,
        siteName: settings.siteName,
        siteDescription: settings.siteDescription
      } : null,
      debug: {
        siteSettingsExists: !!siteSettings,
        settingsExists: !!settings,
        logoInSiteSettings: siteSettings?.logo?.url || 'not found',
        logoInSettings: settings?.logo || 'not found'
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Debug hatası', details: error },
      { status: 500 }
    );
  }
} 