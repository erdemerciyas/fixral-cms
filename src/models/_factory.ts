type AnyObj = Record<string, any>;

// Önerilen SEO içeriği — admin formları boş alanlarda bu değerleri kullanır
const seoDescription =
  '3D tarama, tersine mühendislik, CAD modelleme, 3D baskı ve CNC ile kırık ya da bulunamayan parçaları ölçüp yeniden üreten mühendislik atölyesi. Teklif alın.';

export const seoDefaults = {
  siteName: 'FIXRAL',
  siteUrl: 'https://www.fixral.com',
  slogan:
    'Kırık parçadan üretim dosyasına: 3D tarama, tersine mühendislik, CAD modelleme, 3D baskı, CNC ve araç elektroniği hizmetleri tek atölyede.',
  description:
    'FIXRAL; var olan bir parçayı tarayıp ölçülü CAD modeline çeviren, baskı, CNC ya da elektronik kartla yeniden üreten ve bu işler için kendi yazılımlarını geliştiren bir mühendislik atölyesidir.',
  seo: {
    metaTitle: 'FIXRAL | 3D Tarama, Tersine Mühendislik ve Üretim',
    metaDescription: seoDescription,
    keywords: ['FIXRAL', 'mühendislik atölyesi', 'parça üretimi'],
  },
  seoConfig: {
    metaTitleSuffix: ' | 3D Tarama, Tersine Mühendislik ve Üretim',
    globalMetaDescription: seoDescription,
    globalKeywords: [
      '3D tarama',
      '3D tarama hizmeti',
      'tersine mühendislik',
      'CAD modelleme',
      'parametrik CAD',
      '3D modelleme',
      '3D baskı',
      'FDM baskı',
      'SLA baskı',
      'SLS baskı',
      'CNC işleme',
      'prototipleme',
      'yedek parça üretimi',
      'plastik parça restorasyonu',
      'araç restorasyon',
      'ECU çözümleri',
      'otomotiv elektroniği',
      'PCB tasarımı',
      'gömülü sistem',
      'ölçüm raporu',
    ],
  },
};

export const defaultSiteSettings: AnyObj = {
  logo: { url: '', alt: 'FIXRAL', width: 200, height: 60 },
  siteName: seoDefaults.siteName,
  logoText: '',
  slogan: seoDefaults.slogan,
  description: seoDefaults.description,
  colors: { primary: '#003450', secondary: '#075985', accent: '#0369a1' },
  socialMedia: { linkedin: '', twitter: '', github: '', instagram: '' },
  seo: seoDefaults.seo,
  contact: { email: '', phone: '', address: '' },
  siteUrl: seoDefaults.siteUrl,
  timezone: 'Europe/Istanbul',
  language: 'tr',
  favicon: '',
  maintenanceMode: false,
  allowRegistration: true,
  enableComments: true,
  analytics: {
    googleAnalyticsId: '',
    googleTagManagerId: '',
    googleSiteVerification: '',
    enableAnalytics: false,
  },
  system: { maxUploadSize: 10 },
  seoConfig: {
    ...seoDefaults.seoConfig,
    enableSchemaMarkup: true,
    enableOpenGraph: true,
    enableTwitterCards: true,
  },
  analyticsConfig: {
    googleAnalyticsId: '',
    googleTagManagerId: '',
    googleSiteVerification: '',
    enablePageViewTracking: true,
  },
  socialMediaConfig: {
    twitter: '',
    instagram: '',
    linkedin: '',
    github: '',
    facebook: '',
    youtube: '',
    enableSharing: true,
    showShareCount: false,
  },
  isActive: true,
};

export const defaultFooterSettings: AnyObj = {
  mainDescription:
    'Mühendislik ve teknoloji alanında yenilikçi çözümler sunarak projelerinizi hayata geçiriyoruz.',
  contactInfo: {
    email: 'erdem.erciyas@gmail.com',
    phone: '+90 (500) 123 45 67',
    address: 'Teknoloji Vadisi, Ankara, Türkiye',
  },
  quickLinks: [
    { title: 'Anasayfa', url: '/', isExternal: false },
    { title: 'Hizmetler', url: '/services', isExternal: false },
    { title: 'Projeler', url: '/portfolio', isExternal: false },
    { title: 'İletişim', url: '/contact', isExternal: false },
  ],
  socialLinks: {
    linkedin: '',
    twitter: '',
    instagram: '',
    facebook: '',
    github: '',
    youtube: '',
  },
  copyrightInfo: {
    companyName: 'FIXRAL',
    year: new Date().getFullYear(),
    additionalText: 'Tum Haklari Saklidir.',
  },
  developerInfo: {
    name: 'Erdem Erciyas',
    website: 'https://www.erdemerciyas.com.tr',
    companyName: 'Erciyas Engineering',
  },
  visibility: {
    showQuickLinks: true,
    showSocialLinks: true,
    showContactInfo: true,
    showDeveloperInfo: true,
  },
  theme: {
    backgroundColor: 'bg-slate-800',
    textColor: 'text-slate-300',
    accentColor: 'text-brand-primary-400',
  },
};
