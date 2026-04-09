/**
 * API Route for Active Theme Config
 * GET - Returns the theme configuration from SiteSettings
 */

import { NextRequest, NextResponse } from 'next/server';
import SiteSettings from '@/models/SiteSettings';
import connectDB from '@/lib/mongoose';

export async function GET(_request: NextRequest) {
  try {
    await connectDB();

    const siteSettings = await SiteSettings.getSiteSettings();
    const themeConfig = siteSettings.themeConfig;

    if (themeConfig && Object.keys(themeConfig).length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          _id: 'site-theme',
          name: 'Site Theme',
          slug: 'fixral',
          config: themeConfig,
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: 'default',
        name: 'Default Theme',
        slug: 'fixral',
        config: {
          colors: {
            primary: '#003450',
            secondary: '#3A506B',
            accent: '#003450',
            background: '#F8F9FA',
            text: '#3D3D3D',
          },
          fonts: {
            heading: 'Inter',
            body: 'Inter',
          },
          layout: {
            maxWidth: 1280,
            sidebar: false,
            headerStyle: 'fixed',
            footerStyle: 'simple',
          },
          features: {
            heroSlider: true,
            portfolioGrid: true,
            blogList: true,
            contactForm: true,
          },
        },
      }
    });
  } catch (error) {
    console.error('[Themes API] Error fetching theme config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch theme config' },
      { status: 500 }
    );
  }
}
