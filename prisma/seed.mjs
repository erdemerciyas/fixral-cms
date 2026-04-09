import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

// Helper: deterministic seed IDs
function seedId(prefix, n) {
  return `seed-${prefix}-${String(n).padStart(3, '0')}`;
}

async function main() {
  // ═══════════════════════════════════════════
  // Existing seed data (untouched)
  // ═══════════════════════════════════════════

  // SiteSettings
  await prisma.siteSettingsRow.upsert({
    where: { id: '64f000000000000000000001' },
    update: {},
    create: {
      id: '64f000000000000000000001',
      siteName: 'Fixral',
      slogan: '',
      isActive: true,
      logo: { url: '', alt: 'Site Logo', width: 200, height: 60 },
      colors: { primary: '#003450', secondary: '#075985', accent: '#0369a1' },
      socialMedia: { linkedin: '', twitter: '', github: '', instagram: '' },
      seo: { metaTitle: '', metaDescription: '', keywords: [] },
      contact: { email: '', phone: '', address: '' },
      analytics: {
        googleAnalyticsId: '',
        googleTagManagerId: '',
        googleSiteVerification: '',
        enableAnalytics: false,
      },
      system: { maxUploadSize: 10 },
      themeConfig: {
        colors: { primary: '#003450', secondary: '#3A506B', accent: '#003450', background: '#F8F9FA', text: '#3D3D3D' },
        layout: { maxWidth: 1280, sidebar: false, headerStyle: 'fixed', footerStyle: 'simple' },
        features: { heroSlider: true, portfolioGrid: true, blogList: true, contactForm: true },
        fonts: { heading: 'Inter', body: 'Inter' },
      },
      seoConfig: { metaTitleSuffix: ' | Fixral', globalMetaDescription: '', globalKeywords: [], enableSchemaMarkup: true, enableOpenGraph: true, enableTwitterCards: true },
      analyticsConfig: { googleAnalyticsId: '', googleTagManagerId: '', googleSiteVerification: '', enablePageViewTracking: true },
      socialMediaConfig: { twitter: '', instagram: '', linkedin: '', github: '', facebook: '', youtube: '', enableSharing: true, showShareCount: false },
    },
  });

  // Language
  await prisma.languageRow.upsert({
    where: { id: '64f000000000000000000003' },
    update: {},
    create: {
      id: '64f000000000000000000003',
      code: 'tr',
      label: 'Turkce',
      nativeLabel: 'Turkce',
      flag: 'TR',
      isDefault: true,
      isActive: true,
      direction: 'ltr',
    },
  });

  // Settings
  await prisma.settingRow.upsert({
    where: { id: '64f000000000000000000004' },
    update: {},
    create: {
      id: '64f000000000000000000004',
      key: 'site',
      value: {
        siteName: 'Fixral',
        siteTitle: 'Fixral',
        siteDescription: '',
        siteKeywords: '',
        siteUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        logo: '',
        favicon: '/favicon.ico',
        isActive: true,
      },
    },
  });

  // Admin User
  await prisma.userRow.upsert({
    where: { email: 'admin@fixral.local' },
    update: {},
    create: {
      id: '64f000000000000000000005',
      name: 'Admin',
      email: 'admin@fixral.local',
      password: '$2a$10$0QvWj7Ww6x6o3YhFUD0xbe7tNu8NwM7fk2Mrr2cRPxw7dQ0v9UKyu',
      role: 'admin',
      isActive: true,
    },
  });

  // ═══════════════════════════════════════════
  // DUMMY DATA — 10 items per content type
  // ═══════════════════════════════════════════

  console.log('Seeding dummy data...');

  // ── 1. Users (10 test users) ──────────────
  const hashedPassword = await bcrypt.hash('Test1234!', 10);
  const users = [
    { name: 'Ahmet Yılmaz', email: 'ahmet@test.com' },
    { name: 'Elif Demir', email: 'elif@test.com' },
    { name: 'Mehmet Kaya', email: 'mehmet@test.com' },
    { name: 'Zeynep Arslan', email: 'zeynep@test.com' },
    { name: 'Burak Çelik', email: 'burak@test.com' },
    { name: 'Selin Yıldız', email: 'selin@test.com' },
    { name: 'Emre Şahin', email: 'emre@test.com' },
    { name: 'Ayşe Korkmaz', email: 'ayse@test.com' },
    { name: 'Can Öztürk', email: 'can@test.com' },
    { name: 'Defne Aydın', email: 'defne@test.com' },
  ];

  for (let i = 0; i < users.length; i++) {
    await prisma.userRow.upsert({
      where: { email: users[i].email },
      update: {},
      create: {
        id: seedId('user', i + 1),
        name: users[i].name,
        email: users[i].email,
        password: hashedPassword,
        role: 'user',
        isActive: true,
      },
    });
  }
  console.log('  ✓ Users');

  // ── 2. Categories (10 blog categories) ────
  const categories = [
    { name: 'Teknoloji', slug: 'teknoloji', desc: 'Teknoloji haberleri ve gelişmeler' },
    { name: 'Yazılım', slug: 'yazilim', desc: 'Yazılım geliştirme ve programlama' },
    { name: 'Tasarım', slug: 'tasarim', desc: 'UI/UX ve grafik tasarım' },
    { name: 'SEO', slug: 'seo', desc: 'Arama motoru optimizasyonu' },
    { name: 'Mobil', slug: 'mobil', desc: 'Mobil uygulama geliştirme' },
    { name: 'Yapay Zeka', slug: 'yapay-zeka', desc: 'AI ve makine öğrenmesi' },
    { name: 'E-Ticaret', slug: 'e-ticaret', desc: 'E-ticaret çözümleri ve trendler' },
    { name: 'Güvenlik', slug: 'guvenlik', desc: 'Siber güvenlik ve veri koruma' },
    { name: 'Bulut', slug: 'bulut', desc: 'Bulut bilişim ve sunucu yönetimi' },
    { name: 'Girişimcilik', slug: 'girisimcilik', desc: 'Startup ekosistemi ve girişimcilik' },
  ];

  for (let i = 0; i < categories.length; i++) {
    await prisma.categoryRow.upsert({
      where: { slug: categories[i].slug },
      update: {},
      create: {
        id: seedId('cat', i + 1),
        name: categories[i].name,
        slug: categories[i].slug,
        description: categories[i].desc,
        order: i + 1,
        isActive: true,
      },
    });
  }
  console.log('  ✓ Categories');

  // ── 3. News (10 blog posts) ───────────────
  const newsItems = [
    {
      title: 'Yapay Zeka ile Web Geliştirmenin Geleceği',
      slug: 'yapay-zeka-web-gelistirme',
      excerpt: 'AI destekli araçlar web geliştirme süreçlerini nasıl dönüştürüyor?',
      content: '<p>Yapay zeka, web geliştirme dünyasında devrim yaratmaya devam ediyor. Kod tamamlama araçlarından otomatik test yazımına kadar birçok alanda geliştiricilere yardımcı oluyor.</p><p>Bu yazıda, AI destekli geliştirme araçlarının mevcut durumunu ve gelecekteki potansiyelini inceliyoruz.</p>',
      category: 'Yapay Zeka',
      tags: ['ai', 'web', 'geliştirme'],
    },
    {
      title: 'Next.js 15 ile Gelen Yenilikler',
      slug: 'nextjs-15-yenilikler',
      excerpt: 'Next.js 15 sürümünde öne çıkan özellikler ve iyileştirmeler.',
      content: '<p>Next.js 15, performans iyileştirmeleri ve yeni özelliklerle birlikte geldi. Server Components, Turbopack ve geliştirilmiş routing sistemi bu sürümün öne çıkan özellikleri arasında.</p>',
      category: 'Yazılım',
      tags: ['nextjs', 'react', 'frontend'],
    },
    {
      title: 'SEO 2025: Arama Motorlarında Üst Sıralara Çıkma Rehberi',
      slug: 'seo-2025-rehberi',
      excerpt: 'Google algoritma güncellemeleri ve modern SEO stratejileri.',
      content: '<p>2025 yılında SEO stratejileri büyük değişimler geçiriyor. Core Web Vitals, E-E-A-T ve yapay zeka destekli arama sonuçları, site sahiplerinin dikkat etmesi gereken başlıca konular.</p>',
      category: 'SEO',
      tags: ['seo', 'google', 'dijital-pazarlama'],
    },
    {
      title: 'React Native vs Flutter: Hangisini Seçmeli?',
      slug: 'react-native-vs-flutter',
      excerpt: 'Mobil uygulama geliştirme frameworklerinin karşılaştırması.',
      content: '<p>Mobil uygulama geliştirmede iki büyük oyuncu: React Native ve Flutter. Her ikisinin de avantajları ve dezavantajları var. Projenizin ihtiyaçlarına göre hangisini seçmeniz gerektiğini bu yazıda detaylı olarak inceliyoruz.</p>',
      category: 'Mobil',
      tags: ['react-native', 'flutter', 'mobil'],
    },
    {
      title: 'Kubernetes ile Mikroservis Mimarisi',
      slug: 'kubernetes-mikroservis',
      excerpt: 'Container orkestrasyon ve mikroservis yönetimi.',
      content: '<p>Kubernetes, modern uygulamaların dağıtımı ve yönetimi için vazgeçilmez bir araç haline geldi. Bu yazıda, Kubernetes ile mikroservis mimarisi kurmanın temel adımlarını ve best practiceleri paylaşıyoruz.</p>',
      category: 'Bulut',
      tags: ['kubernetes', 'docker', 'devops'],
    },
    {
      title: 'UI/UX Tasarımda 2025 Trendleri',
      slug: 'uiux-2025-trendleri',
      excerpt: 'Bu yıl öne çıkan tasarım trendleri ve kullanıcı deneyimi yaklaşımları.',
      content: '<p>2025 yılında UI/UX tasarımda minimalizm, erişilebilirlik ve kişiselleştirilmiş deneyimler ön plana çıkıyor. Nöromorfizm yerini daha sade ve işlevsel tasarımlara bırakıyor.</p>',
      category: 'Tasarım',
      tags: ['uiux', 'tasarım', 'trend'],
    },
    {
      title: 'E-Ticaret Sitesi Performans Optimizasyonu',
      slug: 'eticaret-performans-optimizasyonu',
      excerpt: 'Online mağazanızın hızını artırmanın yolları.',
      content: '<p>E-ticaret sitelerinde sayfa yükleme hızı, dönüşüm oranlarını doğrudan etkiler. Resim optimizasyonu, CDN kullanımı, lazy loading ve önbellekleme stratejileri ile sitenizi hızlandırabilirsiniz.</p>',
      category: 'E-Ticaret',
      tags: ['e-ticaret', 'performans', 'optimizasyon'],
    },
    {
      title: 'Siber Güvenlikte Sıfır Güven Modeli',
      slug: 'sifir-guven-modeli',
      excerpt: 'Zero Trust güvenlik yaklaşımı ve uygulama stratejileri.',
      content: '<p>Sıfır güven modeli, ağ içindeki veya dışındaki hiçbir kullanıcıya otomatik olarak güvenmemeyi esas alır. Bu yaklaşım, modern siber tehditlere karşı en etkili savunma yöntemlerinden biri olarak öne çıkıyor.</p>',
      category: 'Güvenlik',
      tags: ['güvenlik', 'zero-trust', 'siber'],
    },
    {
      title: 'TypeScript ile Tip Güvenli Backend Geliştirme',
      slug: 'typescript-backend-gelistirme',
      excerpt: 'TypeScript kullanarak sağlam ve sürdürülebilir API\'ler oluşturma.',
      content: '<p>TypeScript, JavaScript ekosisteminde tip güvenliği sağlayarak hata oranını önemli ölçüde azaltıyor. Prisma, tRPC ve Zod gibi araçlarla birlikte kullanıldığında uçtan uca tip güvenliği elde edebilirsiniz.</p>',
      category: 'Yazılım',
      tags: ['typescript', 'backend', 'api'],
    },
    {
      title: 'Startup Kurarken Dikkat Edilmesi Gereken 10 Nokta',
      slug: 'startup-kurarken-10-nokta',
      excerpt: 'Girişimciler için temel tavsiyeler ve deneyimler.',
      content: '<p>Bir startup kurmak heyecan verici ama zorlu bir süreç. Pazar araştırması, MVP geliştirme, finansman bulma ve ekip kurma gibi kritik adımları doğru yönetmek başarının anahtarıdır.</p>',
      category: 'Girişimcilik',
      tags: ['startup', 'girişimcilik', 'iş'],
    },
  ];

  for (let i = 0; i < newsItems.length; i++) {
    const n = newsItems[i];
    await prisma.newsRow.upsert({
      where: { slug: n.slug },
      update: {},
      create: {
        id: seedId('news', i + 1),
        title: n.title,
        slug: n.slug,
        excerpt: n.excerpt,
        content: n.content,
        featuredImage: `https://picsum.photos/seed/${n.slug}/800/450`,
        author: 'Admin',
        isActive: true,
        category: n.category,
        tags: n.tags,
        seoTitle: n.title,
        seoDescription: n.excerpt,
        views: Math.floor(Math.random() * 500) + 50,
        publishedAt: new Date(2025, i, 10 + i),
      },
    });
  }
  console.log('  ✓ News');

  // ── 4. Portfolio (10 projects) ────────────
  const portfolioItems = [
    {
      title: 'E-Ticaret Platformu',
      slug: 'e-ticaret-platformu',
      desc: 'Modern ve ölçeklenebilir bir e-ticaret platformu geliştirdik.',
      content: '<p>Next.js ve Stripe entegrasyonu ile tam kapsamlı bir e-ticaret çözümü. Ürün yönetimi, ödeme sistemi, kargo takibi ve müşteri paneli içerir.</p>',
      techs: ['Next.js', 'React', 'Stripe', 'PostgreSQL', 'Tailwind CSS'],
      category: 'Web Uygulama',
    },
    {
      title: 'Kurumsal Web Sitesi - TechCorp',
      slug: 'techcorp-kurumsal-site',
      desc: 'Teknoloji firması için kurumsal web sitesi tasarımı ve geliştirmesi.',
      content: '<p>TechCorp için modern, hızlı ve SEO uyumlu bir kurumsal web sitesi. Çok dilli yapı, blog sistemi ve iletişim formu içerir.</p>',
      techs: ['Next.js', 'TypeScript', 'Prisma', 'Vercel'],
      category: 'Kurumsal Site',
    },
    {
      title: 'Mobil Fitness Uygulaması',
      slug: 'mobil-fitness-uygulamasi',
      desc: 'Kişiselleştirilmiş antrenman programları sunan mobil uygulama.',
      content: '<p>React Native ile geliştirilmiş cross-platform fitness uygulaması. AI destekli antrenman önerileri, ilerleme takibi ve sosyal özellikler içerir.</p>',
      techs: ['React Native', 'Node.js', 'MongoDB', 'Firebase'],
      category: 'Mobil Uygulama',
    },
    {
      title: 'Restoran Sipariş Sistemi',
      slug: 'restoran-siparis-sistemi',
      desc: 'QR kod tabanlı dijital menü ve sipariş sistemi.',
      content: '<p>Restoranlar için dijital dönüşüm çözümü. QR kod ile menü görüntüleme, online sipariş, mutfak ekranı ve ödeme entegrasyonu.</p>',
      techs: ['Vue.js', 'Node.js', 'Socket.io', 'PostgreSQL'],
      category: 'Web Uygulama',
    },
    {
      title: 'Emlak Portalı',
      slug: 'emlak-portali',
      desc: 'Gayrimenkul listeleme ve arama platformu.',
      content: '<p>Harita entegrasyonlu emlak portalı. Gelişmiş filtreleme, sanal tur, ilan yönetimi ve emlakçı paneli özellikleri ile tam kapsamlı bir platform.</p>',
      techs: ['Next.js', 'Google Maps API', 'Prisma', 'AWS S3'],
      category: 'Web Uygulama',
    },
    {
      title: 'Eğitim Yönetim Sistemi',
      slug: 'egitim-yonetim-sistemi',
      desc: 'Online kurs platformu ve öğrenci takip sistemi.',
      content: '<p>Eğitim kurumları için LMS çözümü. Video ders yönetimi, quiz sistemi, ödev takibi ve sertifika oluşturma özellikleri.</p>',
      techs: ['React', 'Django', 'PostgreSQL', 'Redis', 'Docker'],
      category: 'Web Uygulama',
    },
    {
      title: 'Sağlık Takip Uygulaması',
      slug: 'saglik-takip-uygulamasi',
      desc: 'Hasta ve doktor arasında iletişimi kolaylaştıran sağlık platformu.',
      content: '<p>Randevu yönetimi, reçete takibi, teletıp görüşmeleri ve sağlık kayıtları yönetimi sunan kapsamlı bir sağlık platformu.</p>',
      techs: ['Flutter', 'Firebase', 'Node.js', 'WebRTC'],
      category: 'Mobil Uygulama',
    },
    {
      title: 'Lojistik Takip Paneli',
      slug: 'lojistik-takip-paneli',
      desc: 'Kargo ve filo yönetimi için gerçek zamanlı takip sistemi.',
      content: '<p>Gerçek zamanlı araç takibi, rota optimizasyonu, teslimat yönetimi ve raporlama özellikleri sunan lojistik yönetim paneli.</p>',
      techs: ['React', 'Node.js', 'Socket.io', 'Leaflet', 'PostgreSQL'],
      category: 'Dashboard',
    },
    {
      title: 'SaaS Proje Yönetim Aracı',
      slug: 'saas-proje-yonetim',
      desc: 'Ekipler için Kanban tabanlı proje yönetim aracı.',
      content: '<p>Drag & drop Kanban board, zaman takibi, sprint planlaması ve ekip yönetimi özellikleri. Slack ve GitHub entegrasyonları ile geliştirici dostu bir araç.</p>',
      techs: ['Next.js', 'tRPC', 'Prisma', 'Tailwind CSS', 'Vercel'],
      category: 'SaaS',
    },
    {
      title: 'Sosyal Medya Analiz Aracı',
      slug: 'sosyal-medya-analiz',
      desc: 'Sosyal medya hesaplarını analiz eden ve raporlayan platform.',
      content: '<p>Instagram, Twitter ve LinkedIn hesaplarını analiz eden, içerik performansını ölçen ve otomatik raporlar oluşturan bir SaaS ürünü.</p>',
      techs: ['Python', 'FastAPI', 'React', 'Chart.js', 'Redis'],
      category: 'SaaS',
    },
  ];

  for (let i = 0; i < portfolioItems.length; i++) {
    const p = portfolioItems[i];
    await prisma.portfolioRow.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        id: seedId('port', i + 1),
        title: p.title,
        slug: p.slug,
        description: p.desc,
        content: p.content,
        coverImage: `https://picsum.photos/seed/${p.slug}/800/500`,
        images: [
          `https://picsum.photos/seed/${p.slug}-1/800/500`,
          `https://picsum.photos/seed/${p.slug}-2/800/500`,
          `https://picsum.photos/seed/${p.slug}-3/800/500`,
        ],
        technologies: p.techs,
        category: p.category,
        isActive: true,
        featured: i < 3,
        externalUrl: i % 2 === 0 ? `https://example.com/${p.slug}` : '',
      },
    });
  }
  console.log('  ✓ Portfolio');

  // ── 5. Services (10) ──────────────────────
  const services = [
    {
      title: 'Web Tasarım',
      slug: 'web-tasarim',
      desc: 'Modern ve responsive web siteleri tasarlıyoruz.',
      icon: 'Palette',
      features: ['Responsive Tasarım', 'UI/UX Optimizasyonu', 'Marka Uyumu', 'Hız Optimizasyonu'],
    },
    {
      title: 'Web Geliştirme',
      slug: 'web-gelistirme',
      desc: 'Ölçeklenebilir ve performanslı web uygulamaları geliştiriyoruz.',
      icon: 'Code',
      features: ['Full-Stack Geliştirme', 'API Entegrasyonu', 'Veritabanı Tasarımı', 'DevOps'],
    },
    {
      title: 'Mobil Uygulama Geliştirme',
      slug: 'mobil-uygulama',
      desc: 'iOS ve Android için native ve cross-platform uygulamalar.',
      icon: 'Smartphone',
      features: ['React Native', 'Flutter', 'iOS Native', 'Android Native'],
    },
    {
      title: 'SEO Hizmeti',
      slug: 'seo-hizmeti',
      desc: 'Arama motorlarında üst sıralara çıkmanız için SEO danışmanlığı.',
      icon: 'Search',
      features: ['Teknik SEO', 'İçerik Optimizasyonu', 'Link Building', 'Raporlama'],
    },
    {
      title: 'E-Ticaret Çözümleri',
      slug: 'e-ticaret-cozumleri',
      desc: 'Anahtar teslimi e-ticaret platformları kuruyoruz.',
      icon: 'ShoppingCart',
      features: ['Ödeme Entegrasyonu', 'Stok Yönetimi', 'Kargo Takibi', 'Müşteri Paneli'],
    },
    {
      title: 'Dijital Pazarlama',
      slug: 'dijital-pazarlama',
      desc: 'Markanızı dijital dünyada büyütüyoruz.',
      icon: 'TrendingUp',
      features: ['Google Ads', 'Sosyal Medya Yönetimi', 'İçerik Pazarlama', 'E-posta Pazarlama'],
    },
    {
      title: 'Bulut Altyapı Yönetimi',
      slug: 'bulut-altyapi',
      desc: 'AWS, GCP ve Azure üzerinde altyapı yönetimi ve optimizasyonu.',
      icon: 'Cloud',
      features: ['AWS / GCP / Azure', 'Docker & Kubernetes', 'CI/CD Pipeline', 'Monitoring'],
    },
    {
      title: 'Siber Güvenlik',
      slug: 'siber-guvenlik',
      desc: 'Sistemlerinizi siber tehditlere karşı koruyoruz.',
      icon: 'Shield',
      features: ['Penetrasyon Testi', 'Güvenlik Denetimi', 'WAF Kurulumu', 'SSL Yönetimi'],
    },
    {
      title: 'Yapay Zeka Çözümleri',
      slug: 'yapay-zeka-cozumleri',
      desc: 'İş süreçlerinizi AI ile otomatikleştiriyoruz.',
      icon: 'Brain',
      features: ['Chatbot Geliştirme', 'Veri Analizi', 'Öneri Sistemleri', 'NLP Çözümleri'],
    },
    {
      title: 'Teknik Danışmanlık',
      slug: 'teknik-danismanlik',
      desc: 'Teknoloji seçimi ve mimari tasarım konusunda danışmanlık.',
      icon: 'Users',
      features: ['Mimari Tasarım', 'Teknoloji Seçimi', 'Kod İnceleme', 'Performans Analizi'],
    },
  ];

  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    await prisma.serviceRow.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        id: seedId('svc', i + 1),
        title: s.title,
        slug: s.slug,
        description: s.desc,
        icon: s.icon,
        image: `https://picsum.photos/seed/${s.slug}/600/400`,
        features: s.features,
        isActive: true,
        order: i + 1,
      },
    });
  }
  console.log('  ✓ Services');

  // ── 6. Sliders (10) ───────────────────────
  const sliders = [
    { title: 'Dijital Dönüşümünüzü Başlatın', subtitle: 'Modern web çözümleri ile işinizi büyütün', btn: 'Hemen Başlayın', link: '/iletisim' },
    { title: 'Profesyonel Web Tasarım', subtitle: 'Markanıza özel, etkileyici web siteleri', btn: 'Portföyümüz', link: '/portfolio' },
    { title: 'E-Ticaret Çözümleri', subtitle: 'Online satışlarınızı artırın', btn: 'Detaylı Bilgi', link: '/hizmetler/e-ticaret-cozumleri' },
    { title: 'Mobil Uygulama Geliştirme', subtitle: 'iOS ve Android için native uygulamalar', btn: 'İnceleyin', link: '/hizmetler/mobil-uygulama' },
    { title: 'SEO ile Zirveye Çıkın', subtitle: 'Google\'da ilk sayfada yerinizi alın', btn: 'SEO Analizi', link: '/hizmetler/seo-hizmeti' },
    { title: 'Yapay Zeka Entegrasyonu', subtitle: 'İş süreçlerinizi AI ile otomatikleştirin', btn: 'Keşfedin', link: '/hizmetler/yapay-zeka-cozumleri' },
    { title: 'Bulut Altyapı Yönetimi', subtitle: 'Güvenli ve ölçeklenebilir altyapı', btn: 'Bilgi Alın', link: '/hizmetler/bulut-altyapi' },
    { title: '7/24 Teknik Destek', subtitle: 'Uzman ekibimiz her zaman yanınızda', btn: 'İletişim', link: '/iletisim' },
    { title: 'Güvenli Yazılım Geliştirme', subtitle: 'OWASP standartlarında güvenli kodlama', btn: 'Detaylar', link: '/hizmetler/siber-guvenlik' },
    { title: 'Ücretsiz Danışmanlık', subtitle: 'Projeniz için ücretsiz ön değerlendirme', btn: 'Randevu Alın', link: '/iletisim' },
  ];

  for (let i = 0; i < sliders.length; i++) {
    const sl = sliders[i];
    await prisma.sliderRow.upsert({
      where: { id: seedId('slider', i + 1) },
      update: {},
      create: {
        id: seedId('slider', i + 1),
        title: sl.title,
        subtitle: sl.subtitle,
        description: '',
        buttonText: sl.btn,
        buttonLink: sl.link,
        imageUrl: `https://picsum.photos/seed/slider-${i + 1}/1920/600`,
        isActive: true,
        order: i + 1,
        duration: 5000,
      },
    });
  }
  console.log('  ✓ Sliders');

  // ── 7. Videos (10) ────────────────────────
  const videos = [
    { videoId: 'dQw4w9WgXcQ', title: 'Next.js ile Modern Web Geliştirme', tags: ['nextjs', 'react', 'web'] },
    { videoId: 'jNQXAC9IVRw', title: 'TypeScript Temelleri', tags: ['typescript', 'javascript'] },
    { videoId: '9bZkp7q19f0', title: 'React Hooks Detaylı Rehber', tags: ['react', 'hooks'] },
    { videoId: 'kJQP7kiw5Fk', title: 'Tailwind CSS ile Hızlı Tasarım', tags: ['tailwindcss', 'css'] },
    { videoId: 'RgKAFK5djSk', title: 'Docker ve Kubernetes Giriş', tags: ['docker', 'kubernetes', 'devops'] },
    { videoId: 'JGwWNGJdvx8', title: 'PostgreSQL Performans İpuçları', tags: ['postgresql', 'veritabanı'] },
    { videoId: 'OPf0YbXqDm0', title: 'Git ve GitHub Workflow', tags: ['git', 'github'] },
    { videoId: '2Vv-BfVoq4g', title: 'REST API Tasarım Prensipleri', tags: ['api', 'rest', 'backend'] },
    { videoId: 'fJ9rUzIMcZQ', title: 'Prisma ORM ile Veritabanı Yönetimi', tags: ['prisma', 'orm'] },
    { videoId: 'CevxZvSJLk8', title: 'Vercel ile Deploy Stratejileri', tags: ['vercel', 'deploy', 'ci-cd'] },
  ];

  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    await prisma.videoRow.upsert({
      where: { videoId: v.videoId },
      update: {},
      create: {
        id: seedId('video', i + 1),
        videoId: v.videoId,
        title: v.title,
        description: `${v.title} hakkında detaylı eğitim videosu.`,
        thumbnail: `https://picsum.photos/seed/video-${i + 1}/480/360`,
        publishedAt: new Date(2025, i % 12, 5 + i),
        type: 'normal',
        status: 'visible',
        tags: v.tags,
        channelId: 'UC_seed_channel',
        channelName: 'Fixral Tech',
        channelUrl: 'https://youtube.com/@fixraltech',
      },
    });
  }
  console.log('  ✓ Videos');

  // ── 8. Product Categories (5 parent + 5 child) ──
  const parentCats = [
    { name: '3D Yazıcılar', slug: '3d-yazicilar', desc: '3D yazıcı modelleri' },
    { name: 'Filamentler', slug: 'filamentler', desc: '3D yazıcı filamentleri' },
    { name: 'Yedek Parçalar', slug: 'yedek-parcalar', desc: '3D yazıcı yedek parçaları' },
    { name: 'Elektronik', slug: 'elektronik', desc: 'Elektronik bileşenler' },
    { name: 'Aksesuarlar', slug: 'aksesuarlar', desc: 'Yazıcı aksesuarları' },
  ];

  for (let i = 0; i < parentCats.length; i++) {
    const pc = parentCats[i];
    await prisma.productCategoryRow.upsert({
      where: { slug: pc.slug },
      update: {},
      create: {
        id: seedId('pcat', i + 1),
        name: pc.name,
        slug: pc.slug,
        description: pc.desc,
        order: i + 1,
        isActive: true,
      },
    });
  }

  const childCats = [
    { name: 'FDM Yazıcılar', slug: 'fdm-yazicilar', desc: 'FDM teknolojili yazıcılar', parentIdx: 0 },
    { name: 'Reçine Yazıcılar', slug: 'recine-yazicilar', desc: 'SLA/DLP reçine yazıcılar', parentIdx: 0 },
    { name: 'PLA Filament', slug: 'pla-filament', desc: 'PLA malzeme filamentler', parentIdx: 1 },
    { name: 'ABS Filament', slug: 'abs-filament', desc: 'ABS malzeme filamentler', parentIdx: 1 },
    { name: 'Nozzle', slug: 'nozzle', desc: 'Yazıcı nozzle çeşitleri', parentIdx: 2 },
  ];

  for (let i = 0; i < childCats.length; i++) {
    const cc = childCats[i];
    await prisma.productCategoryRow.upsert({
      where: { slug: cc.slug },
      update: {},
      create: {
        id: seedId('pcat', i + 6),
        name: cc.name,
        slug: cc.slug,
        description: cc.desc,
        order: i + 1,
        parentId: seedId('pcat', cc.parentIdx + 1),
        isActive: true,
      },
    });
  }
  console.log('  ✓ Product Categories');

  // ── 9. Products (10) ──────────────────────
  const products = [
    { title: 'Creality Ender 3 V3', slug: 'creality-ender-3-v3', desc: 'Başlangıç seviyesi FDM 3D yazıcı. Kolay kurulum ve yüksek baskı kalitesi.', price: 8500, stock: 25, catIdx: 5 },
    { title: 'Anycubic Photon Mono X', slug: 'anycubic-photon-mono-x', desc: 'Yüksek çözünürlüklü reçine 3D yazıcı. Detaylı baskılar için ideal.', price: 12000, stock: 15, catIdx: 6 },
    { title: 'Bambu Lab P1S', slug: 'bambu-lab-p1s', desc: 'Hızlı ve güvenilir FDM yazıcı. Multi-color baskı desteği.', price: 22000, stock: 10, catIdx: 5 },
    { title: 'eSUN PLA+ Filament 1kg', slug: 'esun-pla-plus-1kg', desc: 'Yüksek kalite PLA+ filament. 1.75mm, 1kg bobin.', price: 350, stock: 200, catIdx: 7 },
    { title: 'Prusament ASA 1kg', slug: 'prusament-asa-1kg', desc: 'UV dayanımlı ASA filament. Dış mekan kullanımı için ideal.', price: 750, stock: 80, catIdx: 8 },
    { title: 'PETG Filament Şeffaf 1kg', slug: 'petg-filament-seffaf', desc: 'Şeffaf PETG filament. Gıdaya uygun, dayanıklı.', price: 420, stock: 150, catIdx: 7 },
    { title: 'Hardened Steel Nozzle 0.4mm', slug: 'hardened-nozzle-04', desc: 'Sertleştirilmiş çelik nozzle. Aşındırıcı filamentler için.', price: 120, stock: 300, catIdx: 9 },
    { title: 'Raspberry Pi 4 Model B 4GB', slug: 'raspberry-pi-4-4gb', desc: 'Octoprint ve Klipper için ideal mini bilgisayar.', price: 2800, stock: 50, catIdx: 3 },
    { title: 'PEI Manyetik Tabla 235x235', slug: 'pei-tabla-235', desc: 'Esnek PEI manyetik baskı tablası. Ender 3 uyumlu.', price: 280, stock: 100, catIdx: 4 },
    { title: 'BLTouch Sensör Kiti', slug: 'bltouch-sensor-kiti', desc: 'Otomatik tabla seviyeleme sensörü. Kurulum kiti dahil.', price: 450, stock: 60, catIdx: 4 },
  ];

  for (let i = 0; i < products.length; i++) {
    const pr = products[i];
    await prisma.productRow.upsert({
      where: { slug: pr.slug },
      update: {},
      create: {
        id: seedId('prod', i + 1),
        title: pr.title,
        slug: pr.slug,
        description: pr.desc,
        condition: 'new',
        price: pr.price,
        currency: 'TRY',
        coverImage: `https://picsum.photos/seed/${pr.slug}/600/600`,
        images: [
          `https://picsum.photos/seed/${pr.slug}-1/600/600`,
          `https://picsum.photos/seed/${pr.slug}-2/600/600`,
        ],
        stock: pr.stock,
        isActive: true,
        ratingAverage: 0,
        ratingCount: 0,
      },
    });

    // Link product to category
    await prisma.productToCategoryRow.upsert({
      where: {
        productId_categoryId: {
          productId: seedId('prod', i + 1),
          categoryId: seedId('pcat', pr.catIdx),
        },
      },
      update: {},
      create: {
        productId: seedId('prod', i + 1),
        categoryId: seedId('pcat', pr.catIdx),
      },
    });
  }
  console.log('  ✓ Products');

  // ── 10. Contacts (10) ─────────────────────
  const contacts = [
    { name: 'Ali Veli', email: 'ali@example.com', subject: 'Web sitesi teklifi', message: 'Firmamız için kurumsal bir web sitesi yaptırmak istiyoruz. Fiyat teklifi alabilir miyiz?' },
    { name: 'Fatma Kara', email: 'fatma@example.com', subject: 'E-ticaret projesi', message: 'Online mağaza kurmak istiyoruz. Detaylı bilgi alabilir miyim?' },
    { name: 'Hasan Beyaz', email: 'hasan@example.com', subject: 'Mobil uygulama', message: 'Restoranımız için mobil sipariş uygulaması yaptırmak istiyoruz.' },
    { name: 'Merve Güneş', email: 'merve@example.com', subject: 'SEO danışmanlığı', message: 'Web sitemizin SEO çalışması için teklif almak istiyorum.' },
    { name: 'Oğuz Deniz', email: 'oguz@example.com', subject: 'Logo tasarımı', message: 'Yeni markamız için logo ve kurumsal kimlik tasarımı gerekiyor.' },
    { name: 'Seda Yılmaz', email: 'seda@example.com', subject: 'Teknik destek', message: 'Mevcut web sitemizde bazı hatalar var. Düzeltme için destek alabilir miyiz?' },
    { name: 'Kemal Aydın', email: 'kemal@example.com', subject: 'API entegrasyonu', message: 'ERP sistemimizi web sitemiz ile entegre etmek istiyoruz.' },
    { name: 'Nazlı Demir', email: 'nazli@example.com', subject: 'Hosting hizmeti', message: 'Web sitemiz için hosting ve domain hizmeti alabilir miyiz?' },
    { name: 'Baran Çelik', email: 'baran@example.com', subject: 'Staj başvurusu', message: 'Yazılım geliştirme alanında staj yapmak istiyorum. Açık pozisyonunuz var mı?' },
    { name: 'Yasemin Korkmaz', email: 'yasemin@example.com', subject: 'İş birliği teklifi', message: 'Dijital pazarlama alanında iş birliği yapmak istiyoruz. Görüşebilir miyiz?' },
  ];

  for (let i = 0; i < contacts.length; i++) {
    const c = contacts[i];
    await prisma.contactRow.upsert({
      where: { id: seedId('contact', i + 1) },
      update: {},
      create: {
        id: seedId('contact', i + 1),
        name: c.name,
        email: c.email,
        subject: c.subject,
        message: c.message,
        status: i < 3 ? 'read' : 'new',
      },
    });
  }
  console.log('  ✓ Contacts');

  // ── 11. Messages (10) ─────────────────────
  const messages = [
    { name: 'Ahmet Yılmaz', email: 'ahmet@test.com', subject: 'Sipariş hakkında', message: 'Siparişimin ne zaman kargoya verileceğini öğrenmek istiyorum.', type: 'order' },
    { name: 'Elif Demir', email: 'elif@test.com', subject: 'Ürün sorusu', message: 'Bu ürünün garantisi var mı?', type: 'product' },
    { name: 'Mehmet Kaya', email: 'mehmet@test.com', subject: 'İade talebi', message: 'Aldığım ürünü iade etmek istiyorum. Prosedür nedir?', type: 'order' },
    { name: 'Zeynep Arslan', email: 'zeynep@test.com', subject: 'Fiyat bilgisi', message: 'Toplu alımlarda indirim uyguluyor musunuz?', type: 'contact' },
    { name: 'Burak Çelik', email: 'burak@test.com', subject: 'Teknik destek', message: '3D yazıcım baskı sırasında katman kayması yapıyor. Yardım edebilir misiniz?', type: 'contact' },
    { name: 'Selin Yıldız', email: 'selin@test.com', subject: 'Kargo hasarı', message: 'Kargo geldiğinde kutuda hasar vardı. Ne yapmalıyım?', type: 'order' },
    { name: 'Emre Şahin', email: 'emre@test.com', subject: 'Stok sorusu', message: 'Bu ürün ne zaman tekrar stoğa girecek?', type: 'product' },
    { name: 'Ayşe Korkmaz', email: 'ayse@test.com', subject: 'Ödeme sorunu', message: 'Kredi kartı ile ödeme yaparken hata alıyorum.', type: 'contact' },
    { name: 'Can Öztürk', email: 'can@test.com', subject: 'Kurulum yardımı', message: 'Yazıcının kurulumunda sorun yaşıyorum. Kurulum kılavuzu var mı?', type: 'product' },
    { name: 'Defne Aydın', email: 'defne@test.com', subject: 'Teşekkür', message: 'Siparişim çok hızlı geldi, kaliteden çok memnunum. Teşekkürler!', type: 'contact' },
  ];

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    await prisma.messageRow.upsert({
      where: { id: seedId('msg', i + 1) },
      update: {},
      create: {
        id: seedId('msg', i + 1),
        name: m.name,
        email: m.email,
        subject: m.subject,
        message: m.message,
        status: i < 4 ? 'read' : 'unread',
        type: m.type,
      },
    });
  }
  console.log('  ✓ Messages');

  // ── 12. Orders (10) ───────────────────────
  const orderStatuses = ['new', 'processing', 'shipped', 'delivered', 'delivered', 'delivered', 'cancelled', 'new', 'processing', 'delivered'];
  const customerNames = ['Ali Veli', 'Fatma Kara', 'Hasan Beyaz', 'Merve Güneş', 'Oğuz Deniz', 'Seda Yılmaz', 'Kemal Aydın', 'Nazlı Demir', 'Baran Çelik', 'Yasemin Korkmaz'];

  for (let i = 0; i < 10; i++) {
    const prodIdx = i % products.length;
    const pr = products[prodIdx];
    await prisma.orderRow.upsert({
      where: { id: seedId('order', i + 1) },
      update: {},
      create: {
        id: seedId('order', i + 1),
        productId: seedId('prod', prodIdx + 1),
        productName: pr.title,
        productSlug: pr.slug,
        customerName: customerNames[i],
        customerEmail: `${customerNames[i].toLowerCase().replace(' ', '.')}@example.com`,
        customerPhone: `053${String(i + 1).padStart(8, '0')}`,
        customerAddress: `İstanbul, Türkiye - Adres ${i + 1}`,
        quantity: (i % 3) + 1,
        price: pr.price * ((i % 3) + 1),
        status: orderStatuses[i],
        note: i % 2 === 0 ? 'Hediye paketi yapılsın lütfen.' : '',
        createdAt: new Date(2025, Math.floor(i / 3), 5 + i * 2),
      },
    });
  }
  console.log('  ✓ Orders');

  // ── 13. Product Reviews (10) ──────────────
  const reviewComments = [
    { title: 'Harika ürün!', comment: 'Baskı kalitesi beklediğimden çok daha iyi. Kesinlikle tavsiye ederim.', rating: 5 },
    { title: 'Fiyat/performans iyi', comment: 'Bu fiyata bu kalite gerçekten iyi. Küçük kusurları var ama genel olarak memnunum.', rating: 4 },
    { title: 'İdare eder', comment: 'Ortalama bir ürün. Çok iyi değil ama çok da kötü değil.', rating: 3 },
    { title: 'Çok memnunum', comment: 'Hızlı kargo, kaliteli ürün. Teşekkürler!', rating: 5 },
    { title: 'Beklentimi karşıladı', comment: 'Ürün açıklamada yazıldığı gibi. Sorunsuz çalışıyor.', rating: 4 },
    { title: 'Süper kalite', comment: 'Daha önce farklı markalar denedim ama bu en iyisi.', rating: 5 },
    { title: 'Tavsiye ederim', comment: 'Kurulumu kolay, baskı sonuçları tatmin edici.', rating: 4 },
    { title: 'İyi ama geliştirilebilir', comment: 'Genel olarak iyi bir ürün. Ambalaj biraz daha iyi olabilirdi.', rating: 3 },
    { title: 'Mükemmel!', comment: 'Tam aradığım ürün. 3D baskı hobime harika bir katkı sağladı.', rating: 5 },
    { title: 'Gayet başarılı', comment: 'İkinci kez alıyorum, her seferinde aynı kaliteyi sunuyor.', rating: 4 },
  ];

  for (let i = 0; i < reviewComments.length; i++) {
    const r = reviewComments[i];
    await prisma.productReviewRow.upsert({
      where: { id: seedId('review', i + 1) },
      update: {},
      create: {
        id: seedId('review', i + 1),
        productId: seedId('prod', (i % products.length) + 1),
        userId: seedId('user', (i % users.length) + 1),
        title: r.title,
        comment: r.comment,
        rating: r.rating,
        status: i < 8 ? 'approved' : 'pending',
      },
    });
  }
  console.log('  ✓ Product Reviews');

  console.log('\nDummy data seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed completed.');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
