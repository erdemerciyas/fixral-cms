import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import PageSetting from '../../../../models/PageSetting';
import { withFxRevalidate } from '@/lib/fx-revalidate';

export async function GET() {
  try {
    // Allow public access for navigation data (no auth check for public navigation)
    // const url = new URL(request.url); // Reserved for future query parameter handling
    let pages = await PageSetting.find().sort({ order: 1 });

    // Varsayılan sayfalar — yalnızca koleksiyon tamamen boşken seed edilir.
    // Mevcut kayıtlar varsa admin tarafından silinmiş/düzenlenmiş olabilir, dokunulmaz.
    const defaultPages = [
      { pageId: 'home', title: 'Ana Sayfa', path: '/', description: 'Mühendislik ve 3D tarama hizmetlerimizi keşfedin', icon: 'HomeIcon', isExternal: false, isActive: true, showInNavigation: true, order: 0 },
      { pageId: 'services', title: 'Hizmetler', path: '/services', description: 'Sekiz hizmet, üç disiplin, tek atölye.', icon: 'WrenchScrewdriverIcon', isExternal: false, isActive: true, showInNavigation: true, order: 1 },
      { pageId: 'software', title: 'Yazılımlar', path: '/software', description: 'Atölyenin araçları, herkesin tarayıcısında.', icon: 'CodeBracketIcon', isExternal: false, isActive: true, showInNavigation: true, order: 2 },
      { pageId: 'portfolio', title: 'Projeler', path: '/portfolio', description: 'Ölçtüğümüz, modellediğimiz, ürettiğimiz parçalar.', icon: 'FolderOpenIcon', isExternal: false, isActive: true, showInNavigation: true, order: 3 },
      { pageId: 'videos', title: 'Videolar', path: '/videos', description: 'YouTube kanalımızdaki videoları izleyin', icon: 'FilmIcon', isExternal: false, isActive: true, showInNavigation: true, order: 5 },
      { pageId: 'contact', title: 'İletişim', path: '/contact', description: 'Parçanızı anlatın, yöntemi biz önerelim.', icon: 'PhoneIcon', isExternal: false, isActive: true, showInNavigation: true, order: 6 },
      { pageId: 'news', title: 'Haberler', path: '/haberler', description: 'Güncel haberler ve duyurular', icon: 'NewspaperIcon', isExternal: false, isActive: true, showInNavigation: true, order: 4 },
    ];

    if (pages.length === 0) {
      pages = await PageSetting.insertMany(defaultPages);
    }

    const response = NextResponse.json(pages);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('Page settings fetch error:', error);
    const fallbackPages = [
      { pageId: 'home', title: 'Ana Sayfa', path: '/', description: 'Mühendislik ve 3D tarama hizmetlerimizi keşfedin', icon: 'HomeIcon', isExternal: false, isActive: true, showInNavigation: true, order: 0 },
      { pageId: 'services', title: 'Hizmetler', path: '/services', description: 'Sekiz hizmet, üç disiplin, tek atölye.', icon: 'WrenchScrewdriverIcon', isExternal: false, isActive: true, showInNavigation: true, order: 1 },
      { pageId: 'software', title: 'Yazılımlar', path: '/software', description: 'Atölyenin araçları, herkesin tarayıcısında.', icon: 'CodeBracketIcon', isExternal: false, isActive: true, showInNavigation: true, order: 2 },
      { pageId: 'portfolio', title: 'Projeler', path: '/portfolio', description: 'Ölçtüğümüz, modellediğimiz, ürettiğimiz parçalar.', icon: 'FolderOpenIcon', isExternal: false, isActive: true, showInNavigation: true, order: 3 },
      { pageId: 'videos', title: 'Videolar', path: '/videos', description: 'YouTube kanalımızdaki videoları izleyin', icon: 'FilmIcon', isExternal: false, isActive: true, showInNavigation: true, order: 5 },
      { pageId: 'contact', title: 'İletişim', path: '/contact', description: 'Parçanızı anlatın, yöntemi biz önerelim.', icon: 'PhoneIcon', isExternal: false, isActive: true, showInNavigation: true, order: 6 },
      { pageId: 'news', title: 'Haberler', path: '/haberler', description: 'Güncel haberler ve duyurular', icon: 'NewspaperIcon', isExternal: false, isActive: true, showInNavigation: true, order: 4 },
    ];
    const resp = NextResponse.json(fallbackPages, { status: 200 });
    resp.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    resp.headers.set('Pragma', 'no-cache');
    resp.headers.set('Expires', '0');
    resp.headers.set('Surrogate-Control', 'no-store');
    return resp;
  }
}

async function POST__handler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { pageId, ...updates } = await request.json();

    const page = await PageSetting.findOneAndUpdate(
      { pageId },
      updates,
      { new: true, upsert: true }
    );

    return NextResponse.json(page);
  } catch (error) {
    console.error('Page settings update error:', error);
    return NextResponse.json(
      { message: 'Sayfa ayarları güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

async function PUT__handler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const pages = await request.json();

    // Update all pages with new order
    const updatePromises = pages.map((page: { pageId: string; order: number }) =>
      PageSetting.findOneAndUpdate(
        { pageId: page.pageId },
        { order: page.order },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ message: 'Sayfa sıralaması güncellendi' });
  } catch (error) {
    console.error('Page order update error:', error);
    return NextResponse.json(
      { message: 'Sayfa sıralaması güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

async function DELETE__handler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { pageId } = await request.json();
    if (!pageId) {
      return NextResponse.json({ message: 'pageId gereklidir' }, { status: 400 });
    }

    await PageSetting.deleteOne({ pageId });

    return NextResponse.json({ message: 'Sayfa silindi' });
  } catch (error) {
    console.error('Page delete error:', error);
    return NextResponse.json(
      { message: 'Sayfa silinirken hata oluştu' },
      { status: 500 }
    );
  }
}

// Panel → site canlı tazeleme (redesign 2026)
export const POST = withFxRevalidate(POST__handler);
export const PUT = withFxRevalidate(PUT__handler);
export const DELETE = withFxRevalidate(DELETE__handler);
