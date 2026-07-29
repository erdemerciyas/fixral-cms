type AnyObj = Record<string, any>;

export const defaultSiteSettings: AnyObj = {
  logo: { url: '', alt: 'Site Logo', width: 200, height: 60 },
  siteName: '',
  logoText: '',
  slogan: '',
  description: '',
  colors: { primary: '#003450', secondary: '#075985', accent: '#0369a1' },
  socialMedia: { linkedin: '', twitter: '', github: '', instagram: '' },
  seo: { metaTitle: '', metaDescription: '', keywords: [] },
  contact: { email: '', phone: '', address: '' },
  siteUrl: '',
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
    metaTitleSuffix: ' | Fixral',
    globalMetaDescription: '',
    globalKeywords: [],
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
