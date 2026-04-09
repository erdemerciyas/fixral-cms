import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongoose';
import FooterSettings from '../../../../models/FooterSettings';
import { withSecurity, SecurityConfigs } from '../../../../lib/security-middleware';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: Footer ayarlarını getir
export const GET = withSecurity(SecurityConfigs.admin)(async () => {
  try {
    console.log('🔄 Footer settings GET request started');
    await connectDB();
    console.log('✅ Database connected');
    
    const settings = await FooterSettings.getSingleton();
    console.log('✅ Footer settings retrieved:', settings ? 'Found' : 'Not found');
    
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('❌ Footer settings fetch error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        message: 'Footer ayarları alınamadı',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
})

// PUT: Footer ayarlarını güncelle  
export const PUT = withSecurity(SecurityConfigs.admin)(async (request: Request) => {
  try {
    console.log('🔄 Footer settings PUT request started');
    
    console.log('🔗 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');
    
    console.log('📥 Reading request body...');
    const updateData = await request.json();
    console.log('📝 Update data received:', JSON.stringify(updateData, null, 2));
    
    // Validate required fields
    if (!updateData || typeof updateData !== 'object') {
      console.log('❌ Invalid update data');
      return NextResponse.json(
        { message: 'Geçersiz veri formatı' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Finding existing settings...');
    let settings = await FooterSettings.findOne();
    console.log('Existing settings:', settings ? 'Found' : 'Not found');
    
    if (!settings) {
      console.log('📄 Creating new footer settings');
      try {
        settings = new FooterSettings(updateData);
        console.log('✅ New settings created');
      } catch (createError) {
        console.error('❌ Error creating new settings:', createError);
        throw createError;
      }
    } else {
      console.log('📝 Updating existing footer settings');
      try {
        const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mergeDeep = (target: any, source: any) => {
          for (const key in source) {
            if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
            if (DANGEROUS_KEYS.has(key)) continue;
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
              if (!target[key]) target[key] = {};
              mergeDeep(target[key], source[key]);
            } else {
              target[key] = source[key];
            }
          }
        };
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mergeDeep(settings as any, updateData as any);
        console.log('✅ Settings merged successfully');
      } catch (mergeError) {
        console.error('❌ Error merging settings:', mergeError);
        throw mergeError;
      }
    }
    
    console.log('💾 Saving settings to database...');
    try {
      await settings.save();
      console.log('✅ Footer settings saved successfully');
    } catch (saveError) {
      console.error('❌ Error saving settings:', saveError);
      throw saveError;
    }
    
    return NextResponse.json(
      { 
        message: 'Footer ayarları başarıyla güncellendi',
        settings 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Footer settings update error:', error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { 
            message: 'Veri doğrulama hatası',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          },
          { status: 400 }
        );
      }
      
      if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        return NextResponse.json(
          { 
            message: 'Veritabanı hatası',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        message: 'Footer ayarları güncellenemedi',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
})

// POST: Footer ayarlarını sıfırla (varsayılan değerlere döndür)
export const POST = withSecurity(SecurityConfigs.admin)(async () => {
  try {
    await connectDB();
    
    // Mevcut ayarları sil ve yenilerini oluştur
    await FooterSettings.deleteMany({});
    const newSettings = await FooterSettings.create({});
    
    return NextResponse.json(
      { 
        message: 'Footer ayarları varsayılan değerlere sıfırlandı',
        settings: newSettings 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Footer settings reset error:', error);
    return NextResponse.json(
      { message: 'Footer ayarları sıfırlanamadı' },
      { status: 500 }
    );
  }
})