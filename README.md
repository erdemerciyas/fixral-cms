# Fixral CMS

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Radix-000?style=for-the-badge)](https://ui.shadcn.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Sürüm](https://img.shields.io/badge/Sürüm-5.2.1-blue?style=for-the-badge)]()
[![Lisans](https://img.shields.io/badge/Lisans-Özel-red?style=for-the-badge)]()

**Fixral CMS**, Next.js 16 (App Router, Turbopack), React 19.2, Prisma ORM ve PostgreSQL üzerine inşa edilmiş, üretime hazır, tam kapsamlı bir İçerik Yönetim Sistemidir.

Mühendislik portföyleri, 3D baskı hizmetleri ve ajans web siteleri için tasarlanmış olup; shadcn/ui ile güçlendirilmiş modern admin paneli, zengin içerik düzenleme deneyimi, 115 API endpoint ve 38 admin sayfası sunar.

Herkese açık site, **FIXRAL web 2026** tasarım diliyle (teknik resim paftası estetiği, koyu varsayılan tema, Fixral Turuncu `#F97316`, Space Grotesk · Inter · JetBrains Mono) yeniden kurgulanmıştır: 8 hizmetlik katalog, yazılım vitrinleri, Cults3D entegrasyonlu FX 3D model galerisi, three.js ile kaydırmaya bağlı 3D süreç anlatımı ve 4 adımlı teklif formu.

> **Canlı:** [www.fixral.com](https://www.fixral.com) &nbsp;|&nbsp; **Kaynak:** [github.com/erdemerciyas/fixral-cms](https://github.com/erdemerciyas/fixral-cms)

---

## İçindekiler

- [Temel Özellikler](#temel-özellikler)
- [Ekran Görüntüleri](#ekran-görüntüleri)
- [Mimari](#mimari)
- [Veritabanı Şeması](#veritabanı-şeması)
- [Teknoloji Yığını](#teknoloji-yığını)
- [UI Bileşen Kütüphanesi](#ui-bileşen-kütüphanesi)
- [Proje Yapısı](#proje-yapısı)
- [API Uç Noktaları](#api-uç-noktaları)
- [Admin Panel Sayfaları](#admin-panel-sayfaları)
- [Kurulum](#kurulum)
- [Ortam Değişkenleri](#ortam-değişkenleri)
- [Komutlar](#komutlar)
- [Veritabanı Yönetimi](#veritabanı-yönetimi)
- [Yayınlama (Deployment)](#yayınlama-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Yedekleme Sistemi](#yedekleme-sistemi)
- [Güvenlik](#güvenlik)
- [Performans ve SEO](#performans-ve-seo)
- [PWA Desteği](#pwa-desteği)
- [Çoklu Dil (i18n)](#çoklu-dil-i18n)
- [Proxy Katmanı](#proxy-katmanı)
- [Test](#test)
- [Değişiklik Günlüğü](#değişiklik-günlüğü)
- [Katkıda Bulunma](#katkıda-bulunma)
- [Lisans](#lisans)

---

## Temel Özellikler

### İçerik Yönetimi
- **Portföy Yönetimi:** Resim galerileri, 3D model görüntüleyici (GLB/GLTF/STL), kategoriler ve etiketler ile zengin proje vitrinleri
- **Haber / Blog:** Çoklu dil destekli haber makaleleri, SEO meta verileri, slug tabanlı yönlendirme, klonlama ve zengin metin editörü (Tiptap)
- **Hizmetler Modülü:** Mühendislik hizmetleri için özel sayfa yapıları (Tersine Mühendislik, 3D Tarama, 3D Baskı vb.)
- **Slider Yönetimi:** Anasayfa hero slider'ları, sürükle-bırak sıralama ve medya yönetimi
- **Video Yönetimi:** YouTube entegrasyonu, otomatik kanal senkronizasyonu ve toplu silme
- **Kategori Yönetimi:** Haber ve portföy içerikleri için esnek kategori sistemi
- **3D Model Yönetimi:** GLB/GLTF/STL dosya yükleme, listeleme ve tarayıcı içi görüntüleme
- **Hizmet Kataloğu:** Marka kitabındaki 8 hizmet için detay sayfaları (`/tr/services/[slug]`); eski hizmet slug'ları kalıcı (301) olarak yeni adreslere yönlenir
- **Yazılım Vitrini:** Fixral 3D Splitter, Router Studio ve ESP32-S3 OBD-II için liste ve detay sayfaları (`/tr/software`)
- **FX 3D (Cults3D):** Cults3D GraphQL API'sinden çekilen model galerisi ve detay sayfaları; görünürlük admin panelinden yönetilir
- **Site İçeriği (FX Data):** Hero, süreç, antet, teklif bandı gibi public site metinleri tek panelden düzenlenir; kayıt anında tüm site önbelleği tazelenir

### Admin Paneli (38 Sayfa)
- **Modern Arayüz:** shadcn/ui (Radix primitives + Tailwind) ile tam donanımlı, katlanabilir kenar çubuğu navigasyonu
- **Komut Paleti:** Klavye kısayolu ile hızlı gezinme ve arama (Command Palette)
- **Zengin Metin Editörü:** Tiptap tabanlı editör — tablolar, kod blokları, görseller, linkler, renk ve metin hizalama desteği
- **Medya Kütüphanesi:** Cloudinary destekli sürükle-bırak görsel yükleme, klasör ağacı navigasyonu, galeri görünümü ve medya yönetimi
- **Mesaj Merkezi:** İletişim formları ve proje sorgulamalarına doğrudan panelden yanıt verme, okundu durumu takibi
- **Yedekleme Sistemi:** Tam kapsamlı ZIP yedekleme (veritabanı + Cloudinary medya dosyaları) ve geri yükleme
- **SEO Yönetimi:** Sayfa bazlı meta başlıklar, açıklamalar, canonical URL'ler ve Open Graph ayarları
- **Analitik Paneli:** Site geneli istatistikler, içerik metrikleri ve dashboard
- **Site Ayarları:** Logo yükleme, slogan, iletişim bilgileri, sosyal medya bağlantıları
- **Sayfa Yönetimi:** Navigasyon sıralaması, sayfa görünürlüğü, buton yapılandırması ve şablon sistemi
- **Footer Ayarları:** Alt bilgi alanı içerik, bağlantılar ve görünürlük yönetimi
- **Kullanıcı Yönetimi:** Kullanıcı oluşturma, düzenleme, şifre sıfırlama ve rol tabanlı erişim
- **Profil ve 2FA:** Admin profil düzenleme ve TOTP tabanlı iki faktörlü doğrulama
- **Sitemap Yönetimi:** Admin panelinden sitemap içeriğini kontrol etme
- **Site İçeriği / Yazılımlar / FX 3D:** Redesign 2026 ile gelen public site içerik editörleri

### Çoklu Dil (i18n)
- **Tam i18n Desteği:** Tüm herkese açık sayfalar `[lang]` dinamik segmentleri altında `next-intl` ile
- **Desteklenen Diller:** Türkçe (tr); site tek dillidir, eski `/es/...` adresleri 301 ile `/tr/...` karşılığına yönlenir
- **Admin Dil Sekmeleri:** Her dil için yan yana içerik düzenleme
- **Otomatik Yönlendirme:** Dil ön eki olmayan URL'ler varsayılan dile otomatik yönlendirilir

### Portföy ve 3D Görselleştirme
- **3D Model Görüntüleyici:** Tarayıcı içi GLB/GLTF/STL model desteği — `@react-three/fiber` ve `drei` ile
- **Resim Galerisi:** Lightbox tarzı galeriler — yakınlaştırma, gezinme ve küçük resim şeritleri
- **Gelişmiş Filtreleme:** Kategori filtreleri, arama, sıralama ve sayfalama
- **Klonlama:** Mevcut portföy projelerini tek tıkla kopyalama

### SEO ve Performans
- **ISR Önbellekleme:** Tüm public sayfalar build'de önceden üretilir ve `revalidate` süresiyle tazelenir; admin kayıtları önbelleği anında temizler
- **Dinamik Sitemap ve Robots.txt:** Veritabanından güncel bağlantılarla otomatik oluşturma (`/sitemap.xml`, `/robots.txt`)
- **Canonical URL Yönetimi:** Tüm mutlak URL'ler tek kaynaktan (`NEXT_PUBLIC_APP_URL` → `SITE_URL`) üretilir
- **İndeksleme Kontrolü:** Giriş, kayıt, hesap, çevrimdışı ve bulunamayan içerik sayfaları `noindex`
- **JSON-LD:** Organization, WebSite, NewsArticle, BreadcrumbList ve hizmet listesi yapılandırılmış verileri
- **PWA Desteği:** Service Worker, manifest.json, çevrimdışı sayfa ve yükleme istemi
- **Görsel Optimizasyon:** Sharp ile WebP dönüşümü, EXIF temizleme ve boyut sınırlama
- **Bundle Analizi:** `ANALYZE=true` ile webpack bundle görselleştirme
- **Önbellek Yönetimi:** Çok katmanlı önbellek — bellek içi, Redis-uyumlu ve HTTP cache kontrolleri

---

## Ekran Görüntüleri

> Admin paneli ve herkese açık sayfalardan ekran görüntüleri için [www.fixral.com](https://www.fixral.com) adresini ziyaret edin.

---

## Mimari

```
Next.js 16 App Router (Turbopack)
├── Server Components (SSR veri çekme)
├── Client Components (shadcn/ui ile etkileşimli arayüz)
├── API Routes (115 endpoint — public/ + admin/ ayrımı)
├── Proxy (src/proxy.ts — kimlik doğrulama, i18n, rate limiting, güvenlik başlıkları)
├── Prisma ORM (PostgreSQL / Neon)
├── Prisma Model Adapter (Mongoose-uyumlu API katmanı)
├── Instrumentation (Sentry entegrasyonu — server, edge, client)
└── PWA (Service Worker, manifest, çevrimdışı destek)
```

### Temel Mimari Kararlar
- **Prisma ORM:** Tüm veritabanı işlemleri PostgreSQL (Neon) üzerinden Prisma ile yönetilir. Mongoose-uyumlu bir adapter katmanı (`prisma-model-adapter`) sayesinde mevcut kod tabanı sorunsuz çalışır
- **API Ayrımı:** `api/public/` okuma uç noktaları herkese açıktır; bu gruptaki yazma işlemleri (POST/PUT/PATCH/DELETE) handler içinde `role === 'admin'` kontrolü yapar. `api/admin/` tümüyle proxy seviyesinde admin JWT ile korunur
- **FX Veri Katmanı:** Public site içeriği (`src/content/` varsayılanları + `ServiceRow` kayıtları) `src/lib/fx-data-server.ts` üzerinden `unstable_cache` ile okunur; admin kayıtları `withFxRevalidate` sarmalayıcısıyla `revalidateTag` + `revalidatePath('/', 'layout')` tetikler
- **Admin Arayüzü:** shadcn/ui bileşenleri (Radix + Tailwind) ile katlanabilir kenar çubuğu düzeni ve şablon tabanlı sayfa yapısı
- **Bileşen Stratejisi:** shadcn/ui temel bileşenleri + özel Fixral bileşenleri (`GlassCard`, `MagneticButton`, `ScrollReveal` vb.)
- **Güvenlik Katmanları:** Proxy seviyesinde JWT doğrulama, rate limiting, CSP başlıkları ve kötü amaçlı istek engelleme (`src/proxy.ts` — Next.js 16'da middleware'ın yeni konumu)
- **Instrumentation:** Opsiyonel Sentry entegrasyonu — sunucu, edge ve istemci tarafı hata izleme

---

## Veritabanı Şeması

Prisma ORM ile yönetilen **19 model** — PostgreSQL (Neon) üzerinde:

| Model | Açıklama |
|-------|----------|
| `SiteSettingsRow` | Site geneli ayarlar (SEO, tema, renk, iletişim, analitik JSON) |
| `FooterSettingsRow` | Footer içerik ve bağlantıları |
| `SettingRow` | Genel anahtar/değer ayarları |
| `ContentSettingRow` | İçerik ayarları (anahtar/değer) |
| `PageSettingRow` | Sayfa bazlı navigasyon, yol ve görünürlük ayarları |
| `PageSettingsRow` | Ek sayfa ayarları (anahtar/değer) |
| `PageTemplateRow` | Sayfa şablonları (slug, düzen JSON) |
| `LanguageRow` | Dil tanımları (kod, etiketler, yön, bayrak) |
| `AboutRow` | Hakkımızda bölümü içeriği |
| `UserRow` | Kullanıcılar (e-posta, şifre, rol, adresler JSON) |
| `CategoryRow` | Kategoriler (sıralama, açıklama, aktiflik) |
| `ContactRow` | İletişim formu gönderileri |
| `SliderRow` | Hero slider slaytları (sıralama, süre) |
| `VideoRow` | YouTube/video meta verileri (kanal, etiket, durum) |
| `Model3DRow` | 3D model dosya meta verileri |
| `NewsRow` | Haber/makaleler (slug, SEO, çeviriler JSON, görüntülenme) |
| `PortfolioRow` | Portföy projeleri (çoklu görsel, teknolojiler, öne çıkan) |
| `ServiceRow` | Hizmetler (özellikler, ikon, çeviriler JSON) |
| `MessageRow` | Mesajlar/gelen kutusu (sohbet JSON, admin yanıtı) |

---

## Teknoloji Yığını

| Kategori | Teknoloji |
|----------|-----------|
| **Framework** | Next.js 16.2 (React 19.2 + App Router + Turbopack) |
| **Dil** | TypeScript 5.6 |
| **Veritabanı** | PostgreSQL (Neon) — Prisma ORM 5.22 ile |
| **Stillendirme** | Tailwind CSS v4 (CSS-first yapılandırma), CVA, tailwind-merge, tailwindcss-animate |
| **UI Kütüphanesi** | shadcn/ui (Radix UI primitives — 20+ bileşen) |
| **Zengin Metin** | Tiptap 3.6 (kod blokları, tablolar, görseller, link, renk, hizalama) |
| **Animasyon** | Framer Motion 11.x |
| **İkonlar** | Lucide React, Heroicons, Phosphor Icons |
| **3D Grafik** | Three.js 0.160, React Three Fiber, Drei |
| **Kimlik Doğrulama** | NextAuth.js 4.23 + JWT |
| **Medya** | Cloudinary (görsel yükleme, dönüştürme, CDN) |
| **Çoklu Dil** | next-intl 4.8 |
| **E-posta** | Nodemailer 7.x (Gmail SMTP) |
| **Görsel İşleme** | Sharp 0.32 (WebP, EXIF temizleme) |
| **Dosya İşleme** | Archiver (ZIP oluşturma), ADM-ZIP (ZIP okuma) |
| **Doğrulama** | Zod (API), Validator.js (form) |
| **XSS Koruması** | DOMPurify, sanitize-html |
| **2FA** | OTPLib (TOTP) + QRCode |
| **Test** | Jest 30, Testing Library |
| **Lint / Format** | ESLint 9 (flat config — React Compiler danışmanlık kuralları dahil), Prettier 3, prettier-plugin-tailwindcss |
| **CI/CD** | GitHub Actions (CI + Security Scan), Vercel |
| **Bildirimler** | Sonner (toast), SweetAlert2, react-hot-toast |
| **Slider** | Swiper.js 11 |
| **Veri Çekme** | SWR 2.4 |
| **Tablo** | TanStack React Table 8.21 |
| **Tema** | Özel tema sistemi — public light/dark (`public-theme`) + admin dark/light (`AdminThemeProvider`) |
| **Monitöring** | Sentry (opsiyonel — server, edge, client) |
| **Font** | Barlow (display + body), Geist Mono (teknik aksan) |

---

## UI Bileşen Kütüphanesi

Admin paneli, Radix UI temel bileşenleri üzerine kurulu **shadcn/ui** bileşenlerini kullanır:

| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| `Button` | shadcn/ui | Çoklu varyant: default, destructive, outline, secondary, ghost, link |
| `Input` | shadcn/ui | Etiket destekli form girdisi |
| `Card` | shadcn/ui | Başlık/altbilgi ile içerik konteyneri |
| `Badge` | shadcn/ui | Durum göstergeleri |
| `Dialog` | shadcn/ui | Modal diyaloglar |
| `Sheet` | shadcn/ui | Kayan paneller |
| `Table` | shadcn/ui | TanStack React Table ile veri tabloları |
| `Tabs` | shadcn/ui | Sekmeli navigasyon (dil sekmeleri) |
| `Sidebar` | shadcn/ui | Katlanabilir admin navigasyonu |
| `Tooltip` | shadcn/ui | Üzerine gelme ipuçları |
| `Select` | shadcn/ui | Açılır seçim kutuları |
| `Switch` | shadcn/ui | Aç/kapa anahtarları |
| `Checkbox` | shadcn/ui | Onay kutuları |
| `AlertDialog` | shadcn/ui | Onay diyalogları |
| `ScrollArea` | shadcn/ui | Özel kaydırılabilir alanlar |
| `Breadcrumb` | shadcn/ui | Navigasyon kırıntıları |
| `Skeleton` | shadcn/ui | Yükleme yer tutucuları |
| `Sonner` | shadcn/ui | Toast bildirimleri |
| `DropdownMenu` | shadcn/ui | Açılır menüler |
| `Avatar` | shadcn/ui | Kullanıcı avatarları |
| `Popover` | shadcn/ui | Açılır içerik kutuları |
| `Toggle` | shadcn/ui | Geçiş düğmeleri |
| `ToggleGroup` | shadcn/ui | Geçiş düğme grupları |
| `Collapsible` | shadcn/ui | Katlanabilir bölümler |
| `Separator` | shadcn/ui | Ayırıcı çizgiler |
| `Label` | shadcn/ui | Form etiketleri |

**Özel Bileşenler:** `GlassCard`, `MagneticButton`, `ScrollReveal`, `SectionWrapper`, `EyebrowTag`, `GrainOverlay`, `UniversalEditor`, `Pagination`, `MediaBrowser`, `MediaFolderTree`, `CommandPalette`, `ImageUpload`, `PortfolioImageGallery`, `PWAInstallPrompt`, `ThemeToggle`, `ModernEditor`, `EmptyState`, `DataToolbar`, `ResponsiveModal`, `Spinner`

---

## Proje Yapısı

```
fixral-cms/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # CI/CD pipeline (lint, build, deploy)
│   │   └── security.yml           # Günlük güvenlik taraması (CodeQL + npm audit)
│   ├── ISSUE_TEMPLATE/            # GitHub issue şablonları
│   └── pull_request_template.md   # PR şablonu
├── prisma/
│   ├── schema.prisma              # Veritabanı şeması (19 model)
│   └── seed.mjs                   # Başlangıç veri beslemesi (demo veriler dahil)
├── public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service Worker
│   ├── logo.png                   # Marka logosu (JSON-LD Organization/publisher)
│   ├── brand/                     # Marka varlıkları (SVG işaret, logotip)
│   ├── icons/                     # PWA ikonları
│   └── images/                    # Statik görseller
├── brand/                         # Marka kitabı kaynak dosyaları
├── messages/
│   └── tr.json                    # Türkçe arayüz metinleri
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Kök düzen
│   │   ├── page.tsx               # Kök sayfa (dil yönlendirmesi)
│   │   ├── globals.css            # CSS değişkenleri ve genel stiller
│   │   ├── sitemap.ts             # Dinamik sitemap.xml üretimi
│   │   ├── robots.ts              # Dinamik robots.txt üretimi
│   │   ├── not-found.tsx          # 404 sayfası
│   │   ├── error.tsx              # Hata sınır bileşeni
│   │   ├── global-error.tsx       # Global hata yakalama
│   │   ├── loading.tsx            # Yükleme durumu
│   │   ├── [lang]/                # Herkese açık sayfalar (tek dil: tr)
│   │   │   ├── layout.tsx         # Dil düzeni (next-intl provider, generateStaticParams, setRequestLocale)
│   │   │   ├── page.tsx           # Anasayfa
│   │   │   ├── portfolio/         # Portföy vitrini
│   │   │   │   └── [slug]/        # Portföy detay sayfası
│   │   │   ├── services/          # Hizmet kataloğu
│   │   │   │   └── [slug]/        # Hizmet detay sayfası (8 hizmet)
│   │   │   ├── software/          # Yazılım vitrini
│   │   │   │   └── [slug]/        # Yazılım detay sayfası
│   │   │   ├── fx-3d/             # Cults3D model galerisi
│   │   │   │   └── [slug]/        # Model detay sayfası
│   │   │   ├── haberler/          # Haberler
│   │   │   │   └── [slug]/        # Haber detay sayfası (ISR, sunucu tarafı HTML temizleme)
│   │   │   ├── contact/           # İletişim + 4 adımlı teklif formu
│   │   │   ├── videos/            # Video galerisi
│   │   │   ├── account/           # Kullanıcı hesabı (noindex)
│   │   │   ├── login/             # Giriş sayfası (noindex)
│   │   │   ├── register/          # Kayıt sayfası (noindex)
│   │   │   └── offline/           # Çevrimdışı sayfası — PWA (noindex)
│   │   ├── admin/                 # Admin panel sayfaları (38 sayfa)
│   │   │   ├── layout.tsx         # Admin düzeni (sidebar, header)
│   │   │   ├── dashboard/         # Kontrol paneli
│   │   │   ├── analytics/         # Analitik paneli
│   │   │   ├── news/              # Haber yönetimi (listele/oluştur/düzenle)
│   │   │   ├── portfolio/         # Portföy yönetimi (listele/oluştur/düzenle)
│   │   │   ├── services/          # Hizmet yönetimi (listele/oluştur/düzenle)
│   │   │   ├── categories/        # Kategori yönetimi
│   │   │   ├── models/            # 3D model yönetimi
│   │   │   ├── media/             # Medya kütüphanesi (Cloudinary)
│   │   │   ├── slider/            # Slider yönetimi (listele/oluştur/düzenle)
│   │   │   ├── videos/            # Video yönetimi
│   │   │   ├── messages/          # Mesaj gelen kutusu
│   │   │   ├── contact/           # İletişim mesajları
│   │   │   ├── content/           # İçerik ayarları
│   │   │   ├── pages/             # Sayfa yönetimi
│   │   │   ├── seo/               # SEO ayarları
│   │   │   ├── social-media/      # Sosyal medya bağlantıları
│   │   │   ├── site-settings/     # Site yapılandırması
│   │   │   ├── footer/            # Footer ayarları
│   │   │   ├── settings/          # Genel ayarlar
│   │   │   ├── languages/         # Dil yönetimi
│   │   │   ├── users/             # Kullanıcı yönetimi
│   │   │   ├── backup/            # Yedekleme ve geri yükleme
│   │   │   ├── profile/           # Admin profili ve 2FA
│   │   │   ├── sitemap/           # Sitemap yönetimi
│   │   │   ├── site-content/      # Public site metinleri (FX Data)
│   │   │   ├── software/          # Yazılım vitrini yönetimi
│   │   │   ├── fx-3d/             # Cults3D model görünürlüğü
│   │   │   ├── login/             # Admin giriş sayfası
│   │   │   └── reset-password/    # Şifre sıfırlama
│   │   └── api/
│   │       ├── health/            # Sağlık kontrolü endpoint'i
│   │       ├── auth/              # NextAuth handler'ları
│   │       ├── cron/              # Zamanlanmış görevler (cleanup, video sync — CRON_SECRET korumalı)
│   │       ├── public/            # Herkese açık API (44 endpoint; yazma işlemleri admin rolü ister)
│   │       └── admin/             # Korumalı API (61 endpoint)
│   ├── content/                   # Public site varsayılan içerikleri (fixral.ts, fx-data.ts)
│   ├── components/
│   │   ├── fx/                    # FIXRAL web 2026 bileşenleri (anasayfa bölümleri, kartlar, ikonlar, three.js sahneleri, route loader)
│   │   ├── fx3d/                  # FX 3D (Cults3D) galeri bileşenleri
│   │   ├── software/              # Yazılım vitrini bileşenleri
│   │   ├── services/              # Hizmet kataloğu görünümleri
│   │   ├── ui/                    # shadcn/ui + özel bileşenler
│   │   ├── admin/                 # Admin'e özel bileşenler (sidebar, header, formlar, komut paleti)
│   │   ├── layout/                # Navigasyon, TopBar, mobil menü
│   │   ├── home/                  # Anasayfa bileşenleri
│   │   ├── portfolio/             # Portföy bileşenleri
│   │   ├── news/                  # Haber bileşenleri
│   │   ├── videos/                # Video bileşenleri
│   │   ├── seo/                   # SEO bileşenleri
│   │   ├── providers/             # Context provider'ları
│   │   └── common/                # Paylaşılan bileşenler
│   ├── lib/                       # Çekirdek kütüphane (37 dosya)
│   │   ├── prisma.ts              # Prisma istemci bağlantısı
│   │   ├── prisma-model-adapter.ts # Mongoose-uyumlu Prisma adapter katmanı
│   │   ├── auth.ts                # NextAuth yapılandırması
│   │   ├── admin-auth.ts          # Admin yetkilendirme yardımcıları
│   │   ├── cloudinary.ts          # Cloudinary yapılandırması ve yardımcılar
│   │   ├── media-folders.ts       # Cloudinary klasör ağacı yardımcıları
│   │   ├── site-settings.ts       # Site ayarları servisi
│   │   ├── rate-limit.ts          # Rate limiting mantığı
│   │   ├── security-headers.ts    # CSP ve güvenlik başlıkları
│   │   ├── security-middleware.ts # Güvenlik middleware yardımcıları
│   │   ├── security-utils.ts      # Güvenlik yardımcı fonksiyonları
│   │   ├── csrf.ts                # CSRF token yönetimi
│   │   ├── email.ts               # E-posta gönderme servisi
│   │   ├── seo-utils.ts           # SITE_URL, canonical/alternates ve OG yardımcıları (tek kaynak)
│   │   ├── sitemap-service.ts     # Sitemap oluşturma servisi
│   │   ├── fx-data-server.ts      # Public site verisi (unstable_cache + revalidateFx)
│   │   ├── fx-revalidate.ts       # Admin API sarmalayıcısı: başarılı kayıtta önbelleği tazeler
│   │   ├── fx-quote.ts            # Teklif formu → /api/public/contact gönderimi
│   │   ├── cults3d.ts             # Cults3D GraphQL istemcisi
│   │   ├── markdown-lite.ts       # Hafif markdown → HTML dönüştürücü
│   │   ├── schema-markup.tsx      # JSON-LD yapılandırılmış veri
│   │   ├── news-cache-service.ts  # Haber önbellek servisi
│   │   ├── cache.ts               # Önbellek katmanı
│   │   ├── monitoring.ts          # Performans izleme
│   │   ├── jwt-utils.ts           # JWT yardımcıları
│   │   ├── otp.ts                 # OTP (2FA) yardımcıları
│   │   ├── ai-service.ts          # AI metadata üretimi
│   │   ├── validation.ts          # Doğrulama şemaları
│   │   ├── clone.ts               # İçerik klonlama
│   │   ├── utils.ts               # Genel yardımcılar (cn, vb.)
│   │   └── __tests__/             # Birim testleri
│   ├── models/                    # Prisma model adapter'ları (Mongoose-uyumlu API)
│   ├── hooks/                     # Özel React hook'ları (usePWA vb.)
│   ├── types/                     # TypeScript tip tanımları
│   ├── styles/                    # Tasarım token'ları + FX sayfa stilleri (fx-web, fx-services, fx-3d, fx-loader …)
│   ├── i18n/                      # next-intl yapılandırması
│   ├── instrumentation.ts         # Next.js instrumentation (Sentry)
│   ├── instrumentation-server.ts  # Sunucu tarafı instrumentation
│   ├── instrumentation-client.ts  # İstemci tarafı instrumentation
│   ├── instrumentation-edge.ts    # Edge runtime instrumentation
│   └── proxy.ts                   # Proxy katmanı (Next.js 16 middleware — auth, i18n, güvenlik, rate limit)
├── next.config.js                 # Next.js yapılandırması
├── eslint.config.mjs              # ESLint 9 flat config (React Compiler danışmanlık kuralları dahil)
├── tsconfig.json                  # TypeScript yapılandırması (strict mode)
├── site.config.js                 # Site geneli yapılandırma sabitleri
└── scripts/                       # Yardımcı scriptler (cleanup, contrast test, video sync, Vercel env sync, marka varlığı üretimi, içerik redesign)
```

> **Not:** Tailwind CSS v4 CSS-first yapılandırma kullanır — ayrı bir `tailwind.config.js` yoktur; tema token'ları ve stiller `src/app/globals.css` içinde tanımlıdır.

---

## API Uç Noktaları

Proje toplamda **115 API endpoint** içerir. Aşağıda mantıksal gruplandırma ile:

### Genel
| Endpoint | Yöntem | Açıklama |
|----------|--------|----------|
| `/api/health` | GET | Sağlık kontrolü |
| `/api/test-db` | GET | Veritabanı tablo listesi (yalnızca `development` + admin) |
| `/api/upload` | POST | Dosya yükleme (`/api/admin/upload`'a yönlendirir; admin oturumu gerekir) |

### Kimlik Doğrulama
| Endpoint | Yöntem | Açıklama |
|----------|--------|----------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler'ları |
| `/api/auth/forgot-password` | POST | Şifre sıfırlama e-postası |
| `/api/auth/reset-password` | POST | Şifre sıfırlama |
| `/api/auth/refresh` | POST | Token yenileme |

### Zamanlanmış Görevler
| Endpoint | Yöntem | Açıklama |
|----------|--------|----------|
| `/api/cron/cleanup` | GET | Geçici dosya temizliği (Vercel Cron, her gün 02:00) |
| `/api/cron/sync-youtube-videos` | GET | YouTube video senkronizasyonu |

Cron uç noktaları yalnızca `CRON_SECRET` ile çağrılabilir: `Authorization: Bearer <CRON_SECRET>` (Vercel Cron bunu otomatik gönderir), `x-cron-secret` başlığı veya `?secret=` parametresi. `CRON_SECRET` tanımlı değilse tüm çağrılar 401 döner.

### Public API (`/api/public/`)

Okuma (GET) uç noktaları herkese açıktır. Bu gruptaki yazma işlemleri (haber, hizmet, kategori, portföy, slider, iletişim bilgisi, mesaj güncelleme, AI metadata, 3D model yükleme/silme) **admin rolü** gerektirir; `contact`, `register` ve `user/*` uç noktaları ise ziyaretçi/kullanıcı içindir.

| Grup | Endpoint'ler |
|------|-------------|
| **Haberler** | `news`, `news/[id]`, `news/slug/[slug]`, `news/bulk-action` |
| **Portföy** | `portfolio`, `portfolio/[id]`, `portfolio/slug/[slug]` |
| **Hizmetler** | `services`, `services/[id]` |
| **Kategoriler** | `categories`, `categories/[id]` |
| **Slider** | `slider` |
| **Videolar** | `youtube`, `youtube-health`, `channels` |
| **3D Modeller** | `3dmodels/list`, `3dmodels/upload`, `3dmodels/delete`, `3dmodels/download/[id]` |
| **İletişim** | `contact`, `contact-info`, `messages`, `messages/[id]` |
| **Ayarlar** | `settings`, `settings/sync`, `settings/email` (PUT — mevcut şifre ile), `settings/name`, `settings/password`, `footer-settings`, `languages` |
| **Site Verisi** | `fx-data` (public site içeriği — hizmetler, yazılımlar, hero, süreç) |
| **Kullanıcı** | `register`, `user/addresses`, `user/addresses/[id]`, `user/messages`, `user/messages/[id]` |
| **Güvenlik** | `csrf` |
| **AI** | `ai/generate-metadata` |
| **Monitöring** | `monitoring/performance` |
| **Sitemap** | `sitemap` |

### Admin API (`/api/admin/`)

JWT korumalı uç noktalar:

| Grup | Endpoint'ler |
|------|-------------|
| **Haberler** | `news`, `news/[id]`, `news/[id]/clone` |
| **Portföy** | `portfolio`, `portfolio/[id]`, `portfolio/[id]/clone` |
| **Hizmetler** | `services`, `services/[id]` |
| **Kategoriler** | `categories`, `categories/[id]` |
| **Slider** | `slider`, `slider/[id]`, `slider/reorder` |
| **Videolar** | `videos`, `videos/[id]`, `videos/[id]/status`, `videos/bulk-delete`, `videos/bulk-status` |
| **Site İçeriği** | `fx-content` (FX Data kaydı), `fx-3d` (Cults3D model görünürlüğü) |
| **3D Modeller** | `models`, `models/[id]` |
| **Medya** | `media`, `media/[id]`, `upload`, `logo-upload` |
| **Mesajlar** | `messages`, `messages/[id]`, `messages/[id]/read`, `messages/reply`, `mail-status` |
| **İletişim** | `contact` |
| **Kullanıcılar** | `users`, `users/[id]`, `users/[id]/password`, `users/password`, `users/send-verification` |
| **Profil** | `profile`, `profile/password`, `change-password` |
| **Ayarlar** | `site-settings`, `site-settings/debug`, `footer-settings`, `content-settings`, `languages`, `languages/[id]`, `page-settings`, `page-settings/[pageId]`, `pages`, `pages/[id]` |
| **İçerik** | `content`, `content/[id]` |
| **Dashboard** | `dashboard-stats` |
| **Yedekleme** | `backup/export`, `backup/import` |
| **Güvenlik** | `2fa/setup`, `security` |
| **Sitemap** | `sitemap` |
| **Önbellek** | `clear-cache` |
| **Güncelleme** | `updates/check`, `updates/run` |

---

## Admin Panel Sayfaları

| Sayfa | Yol | Açıklama |
|-------|-----|----------|
| Giriş | `/admin/login` | Admin giriş formu |
| Şifre Sıfırlama | `/admin/reset-password` | Şifre sıfırlama |
| Dashboard | `/admin/dashboard` | Özet istatistikler ve hızlı erişim |
| Analitik | `/admin/analytics` | Detaylı site analitiği |
| Haberler | `/admin/news` | Haber listesi |
| Haber Oluştur | `/admin/news/create` | Yeni haber oluşturma |
| Haber Düzenle | `/admin/news/[id]/edit` | Haber düzenleme |
| Portföy | `/admin/portfolio` | Portföy listesi |
| Portföy Oluştur | `/admin/portfolio/new` | Yeni proje oluşturma |
| Portföy Düzenle | `/admin/portfolio/edit/[id]` | Proje düzenleme |
| Hizmetler | `/admin/services` | Hizmet listesi |
| Hizmet Oluştur | `/admin/services/new` | Yeni hizmet oluşturma |
| Hizmet Düzenle | `/admin/services/edit/[id]` | Hizmet düzenleme |
| Kategoriler | `/admin/categories` | Kategori yönetimi |
| Slider | `/admin/slider` | Slider listesi |
| Slider Oluştur | `/admin/slider/new` | Yeni slayt oluşturma |
| Slider Düzenle | `/admin/slider/[id]/edit` | Slayt düzenleme |
| Videolar | `/admin/videos` | Video yönetimi |
| 3D Modeller | `/admin/models` | 3D model yönetimi |
| Medya | `/admin/media` | Medya kütüphanesi |
| Kullanıcılar | `/admin/users` | Kullanıcı yönetimi |
| Mesajlar | `/admin/messages` | Mesaj gelen kutusu |
| İletişim | `/admin/contact` | İletişim mesajları |
| İçerik | `/admin/content` | İçerik ayarları |
| Sayfalar | `/admin/pages` | Sayfa yönetimi |
| SEO | `/admin/seo` | SEO ayarları |
| Sosyal Medya | `/admin/social-media` | Sosyal medya bağlantıları |
| Site Ayarları | `/admin/site-settings` | Site yapılandırması |
| Footer | `/admin/footer` | Footer ayarları |
| Genel Ayarlar | `/admin/settings` | Genel ayarlar |
| Diller | `/admin/languages` | Dil yönetimi |
| Profil | `/admin/profile` | Admin profili ve 2FA |
| Yedekleme | `/admin/backup` | Yedekleme ve geri yükleme |
| Sitemap | `/admin/sitemap` | Sitemap yönetimi |
| Site İçeriği | `/admin/site-content` | Public site metinleri (hero, süreç, antet, teklif bandı) |
| Yazılımlar | `/admin/software` | Yazılım vitrini kayıtları |
| FX 3D | `/admin/fx-3d` | Cults3D modellerinin sitede görünürlüğü |

---

## Kurulum

### Ön Gereksinimler
- **Node.js** v20 veya üstü
- **npm** v9+
- **PostgreSQL** veritabanı (önerilen: [Neon](https://neon.tech/))
- **Cloudinary** hesabı (görsel yükleme için)

### Adım Adım Kurulum

```bash
# 1. Depoyu klonlayın
git clone https://github.com/erdemerciyas/fixral-cms.git
cd fixral-cms

# 2. Bağımlılıkları yükleyin
npm install

# 3. Ortam değişkenlerini yapılandırın
cp .env.example .env.local
# .env.local dosyasını kendi bilgilerinizle düzenleyin

# 4. Prisma istemcisini oluşturun ve şemayı veritabanına gönderin
npx prisma generate
npx prisma db push

# 5. Başlangıç verilerini yükleyin (admin kullanıcı + demo veriler)
npm run db:seed

# 6. Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

### Varsayılan Admin Hesabı

Seed çalıştırıldıktan sonra aşağıdaki bilgilerle giriş yapabilirsiniz:

| Alan | Değer |
|------|-------|
| **URL** | [http://localhost:3000/admin/login](http://localhost:3000/admin/login) |
| **E-posta** | `admin@fixral.local` |
| **Şifre** | Seed dosyasındaki hash'lenmiş şifre (veya `.env` ile belirlenen şifre) |

> Seed dosyası ayrıca 10 test kullanıcısı, 10 haber, 10 portföy, 11 hizmet, 10 slider, 10 video, 10 iletişim ve 10 mesaj kaydı oluşturur.

---

## Ortam Değişkenleri

Proje kökünde bir `.env.local` dosyası oluşturun (`.env.example` dosyasını temel alın):

```bash
# ─── Veritabanı (Neon PostgreSQL) ───────────────────────
DATABASE_URL=postgresql://user:password@ep-xxxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://user:password@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require

# ─── Kimlik Doğrulama (ZORUNLU) ────────────────────────
NEXTAUTH_SECRET=your-nextauth-secret        # openssl rand -hex 32 ile üretilebilir
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=https://www.fixral.com       # Üretim site URL'si — canonical, sitemap, robots ve JSON-LD'nin tek kaynağı
JWT_SECRET=your-jwt-secret

# ─── Zamanlanmış Görevler (ZORUNLU — üretim) ───────────
CRON_SECRET=uzun-rastgele-bir-deger          # openssl rand -hex 32; Vercel Cron Authorization: Bearer olarak gönderir

# ─── Cloudinary (Görsel Yükleme) ───────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=fixral-cms               # Cloudinary'de medya klasörü ön eki

# ─── Gmail SMTP (E-posta Gönderimi) ────────────────────
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password   # Google Uygulama Şifresi

# ─── YouTube API (Video Senkronizasyonu) ────────────────
YOUTUBE_API_KEY=your-youtube-api-key
YOUTUBE_CHANNEL_ID=your-youtube-channel-id

# ─── Cults3D API (FX 3D sayfası) ───────────────────────
CULTS3D_USERNAME=your-cults3d-username       # https://cults3d.com/en/api/keys
CULTS3D_API_KEY=your-cults3d-api-key
CULTS3D_NICK=FIXRAL                          # Opsiyonel — profil takma adı (varsayılan: kullanıcı adı)

# ─── Admin Bilgileri ───────────────────────────────────
ADMIN_EMAIL=admin@fixral.local
ADMIN_PASSWORD=your-admin-password

# ─── Monitöring (Opsiyonel) ────────────────────────────
SENTRY_DSN=your-sentry-dsn
SLOW_QUERY_THRESHOLD=1000                   # Yavaş sorgu eşiği (ms)
CRITICAL_QUERY_THRESHOLD=5000               # Kritik sorgu eşiği (ms)
SLOW_PAGE_THRESHOLD=3000                    # Yavaş sayfa eşiği (ms)

# ─── Vercel (Üretim) ───────────────────────────────────
VERCEL=1
VERCEL_URL=your-vercel-url

# ─── Geliştirme ────────────────────────────────────────
NODE_ENV=development
```

> **Uyarı:** `.env.local` veya `.env.production` dosyalarını asla versiyon kontrolüne eklemeyin. Şablon olarak `.env.example` dosyasını kullanın.

---

## Komutlar

### Geliştirme

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusunu başlat (otomatik cleanup ile) |
| `npm run build` | Üretim derlemesi oluştur |
| `npm start` | Üretim sunucusunu başlat |
| `npm run clean` | `.next` ve `out` dizinlerini temizle |

### Kod Kalitesi

| Komut | Açıklama |
|-------|----------|
| `npm run lint` | ESLint ile kod kontrolü yap |
| `npm run lint:fix` | Lint sorunlarını otomatik düzelt |
| `npm run type-check` | TypeScript tip kontrolü yap |
| `npm run format` | Prettier ile kodu formatla |
| `npm run contrast` | WCAG kontrast testini çalıştır |

### Test

| Komut | Açıklama |
|-------|----------|
| `npm test` | Jest testlerini çalıştır |
| `npm run test:watch` | Testleri izleme modunda çalıştır |
| `npm run test:coverage` | Testleri kapsam raporu ile çalıştır |

### Veritabanı

| Komut | Açıklama |
|-------|----------|
| `npm run prisma:generate` | Prisma istemcisini oluştur |
| `npm run prisma:migrate` | Prisma migration'ları çalıştır |
| `npm run prisma:push` | Şemayı veritabanına gönder |
| `npm run db:seed` | Veritabanını başlangıç verileriyle doldur |

### Güvenlik ve Performans

| Komut | Açıklama |
|-------|----------|
| `npm run security:check` | npm güvenlik denetimi çalıştır |
| `npm run security:test` | Moderate seviye güvenlik testi |
| `npm run perf:analyze` | Bundle analizi ile build yap |
| `npm run perf:check` | Profil modunda build yap |
| `npm run health:check` | Sağlık kontrolü endpoint'ini test et |

### Yayınlama

| Komut | Açıklama |
|-------|----------|
| `npm run deploy` | Vercel'e üretim deploy'u yap |
| `npm run deploy:preview` | Vercel'e önizleme deploy'u yap |
| `node scripts/sync-vercel-env.mjs` | `.env.local` içeriğini Vercel ortam değişkenlerine senkronize et |
| `npm run sync-videos` | YouTube videolarını senkronize et |

---

## Veritabanı Yönetimi

### Prisma Studio

Veritabanını görsel olarak yönetmek için:

```bash
npx prisma studio
```

Tarayıcınızda [http://localhost:5555](http://localhost:5555) adresinde açılır.

### Migration Oluşturma

```bash
# Yeni migration oluştur
npx prisma migrate dev --name migration_adi

# Migration'ları üretime uygula
npx prisma migrate deploy
```

### Seed Verileri

Seed dosyası (`prisma/seed.mjs`) aşağıdaki verileri oluşturur:

| Veri Tipi | Adet | Açıklama |
|-----------|------|----------|
| Site Ayarları | 1 | Varsayılan tema, SEO ve iletişim yapılandırması |
| Diller | 1 | Türkçe (varsayılan) |
| Genel Ayarlar | 1 | Site adı, URL ve favicon |
| Admin Kullanıcı | 1 | `admin@fixral.local` |
| Test Kullanıcıları | 10 | Demo kullanıcılar |
| Kategoriler | 10 | Blog kategorileri |
| Haberler | 10 | Demo blog yazıları |
| Portföy | 10 | Demo projeler |
| Hizmetler | 11 | Fixral hizmetleri (Tersine Mühendislik, 3D Baskı vb.) |
| Slider'lar | 10 | Anasayfa slaytları |
| Videolar | 10 | Demo video kayıtları |
| İletişim | 10 | Demo iletişim mesajları |
| Mesajlar | 10 | Demo mesajlar |

---

## Yayınlama (Deployment)

### Vercel (Önerilen)

```bash
# Üretim deploy'u
npm run deploy

# Önizleme deploy'u
npm run deploy:preview
```

Vercel dashboard'unda tüm ortam değişkenlerinin yapılandırıldığından emin olun (veya `node scripts/sync-vercel-env.mjs` ile `.env.local` içeriğini tek komutla senkronize edin). PostgreSQL veritabanının (Neon) Vercel ağından erişilebilir olması gerekir.

#### Üretimde Zorunlu Ortam Değişkenleri

| Değişken | Neden |
|----------|-------|
| `DATABASE_URL`, `DIRECT_URL` | Prisma bağlantısı |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `JWT_SECRET` | Oturum ve token imzalama |
| `NEXT_PUBLIC_APP_URL` | Canonical, sitemap, robots, JSON-LD mutlak URL'leri — üretimde `https://www.fixral.com` (build sırasında gömülür; değişince yeniden deploy gerekir) |
| `CRON_SECRET` | Cron uç noktalarının kimlik doğrulaması — yoksa günlük temizlik 401 ile başarısız olur |
| `CLOUDINARY_*` | Medya yükleme ve kütüphane |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | İletişim / teklif formu e-postaları |
| `CULTS3D_USERNAME`, `CULTS3D_API_KEY` | FX 3D galerisi (yoksa galeri boş döner) |

> **Not:** Değerleri CLI ile eklerken sondaki satır sonunun değere dahil olmaması için `printf '%s' "$DEGER" | vercel env add AD production` kullanın (`echo` satır sonu ekler ve imza/karşılaştırma hatalarına yol açar).

#### Vercel Yapılandırma Notları
- `vercel-build` scripti otomatik olarak `prisma generate && next build` çalıştırır
- Node.js 20 çalışma zamanı önerilir
- `experimental.instrumentationHook: true` yapılandırması aktif
- Serverless function timeout limitleri uzun işlemler için (yedekleme vb.) dikkat edilmelidir
- `poweredByHeader: false` ve `compress: true` üretim için aktif
- `vercel.json` yalnızca bölge (`fra1`), fonksiyon süresi, güvenlik başlıkları, `/admin` yönlendirmesi ve cron tanımı içerir; `sitemap.xml` / `robots.txt` doğrudan `src/app/sitemap.ts` ve `src/app/robots.ts` tarafından sunulur (`public/sitemap.xml` gölgelememesi için `.gitignore`'dadır)

---

## CI/CD Pipeline

Proje iki GitHub Actions workflow'u içerir:

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

`main` ve `develop` branch'lerine push/PR durumunda tetiklenir:

| Aşama | İşlem |
|-------|-------|
| **Code Quality** | `npm ci` → ESLint → TypeScript tip kontrolü → npm audit |
| **Build** | Üretim derlemesi (ortam değişkenleri ile) → Artifact yükleme |
| **Deploy** | `main` branch'e push'ta Vercel CLI ile otomatik deploy |

### 2. Güvenlik Taraması (`.github/workflows/security.yml`)

Her gün saat 02:00 UTC'de ve `main` branch'e push/PR durumunda:

| İşlem | Açıklama |
|-------|----------|
| **npm audit** | Bağımlılık güvenlik taraması |
| **CodeQL Analysis** | JavaScript/TypeScript statik analiz |
| **Security Report** | Otomatik güvenlik raporu oluşturma (30 gün saklama) |

### Gerekli GitHub Secrets

| Secret | Açıklama |
|--------|----------|
| `VERCEL_TOKEN` | Vercel kimlik doğrulama token'ı |
| `VERCEL_ORG_ID` | Vercel organizasyon ID'si |
| `VERCEL_PROJECT_ID` | Vercel proje ID'si |
| `NEXTAUTH_SECRET` | NextAuth gizli anahtarı |
| `DATABASE_URL` | PostgreSQL bağlantı dizesi (opsiyonel — CI'da fallback var) |

---

## Yedekleme Sistemi

Admin panelinden (**Admin > Yedekleme**) tam kapsamlı site yedekleme ve geri yükleme yapılabilir.

### Dışa Aktarma (Export)

| Mod | Açıklama |
|-----|----------|
| **Tam Yedek (DB + Medya)** | Tüm veritabanı kayıtları + Cloudinary'den indirilen medya dosyaları tek bir ZIP dosyasında |
| **Sadece Veritabanı** | Medya URL'leri korunur, dosyalar indirilmez (hızlı yedekleme) |

ZIP dosyası içeriği:
- `backup_data.json` — Tüm koleksiyonların JSON dökümü
- `media/` — İndirilen medya dosyaları (tam yedekte)
- `media_manifest.json` — Medya dosyaları listesi ve meta verileri

### İçe Aktarma (Import)
- `.zip` ve `.json` formatlarını destekler
- ZIP dosyası yüklendiğinde otomatik olarak açılır ve `backup_data.json` okunur
- Mevcut kayıtlar güncellenir, yeni kayıtlar oluşturulur (upsert mantığı)

### Yedeklenen Veriler
Haberler, Portföyler, Hizmetler, Slider'lar, Kategoriler, Videolar, 3D Modeller, Kullanıcılar (şifreler hariç), Mesajlar, İletişim Kayıtları, Site Ayarları, Footer Ayarları, İçerik Ayarları, Sayfa Ayarları, Genel Ayarlar, Diller, Hakkında Bilgileri

---

## Güvenlik

| Önlem | Açıklama |
|-------|----------|
| **Veri Doğrulama** | Tüm API uç noktalarında Zod şemaları ve Validator.js |
| **XSS Koruması** | Haber gövdesi sunucuda `sanitize-html` ile izinli etiket/stil listesine göre temizlenir; JSON-LD çıktılarında `<` kaçışlanır |
| **Kimlik Doğrulama** | NextAuth.js — JWT stratejisi ve rol tabanlı erişim kontrolü |
| **Rol Tabanlı Yazma** | Kayıt herkese açık olduğundan `api/public/` altındaki tüm içerik yazma işlemleri oturumun yanında `role === 'admin'` şartı arar |
| **Cron Koruması** | `/api/cron/*` yalnızca `CRON_SECRET` ile; taklit edilebilir `x-vercel-cron` başlığına güvenilmez |
| **Hesap Güvenliği** | E-posta değişikliği yalnızca mevcut şifre doğrulamasıyla (`PUT /api/public/settings/email`) |
| **2FA Desteği** | Admin hesapları için TOTP tabanlı iki faktörlü doğrulama (OTPLib + QRCode) |
| **JWT Güçlendirme** | Yedek gizli anahtar yok; açıkça `NEXTAUTH_SECRET` yapılandırması gerekli |
| **Middleware Güvenliği** | IP engelleme, rate limiting, CSP başlıkları ve kötü amaçlı URL/UA engelleme (`src/proxy.ts`) |
| **CSRF Koruması** | CSRF token üretimi ve doğrulaması |
| **API Ayrımı** | Herkese açık ve admin API rotaları bağımsız auth guard'larla |
| **Content Security Policy** | Sayfa tipine göre dinamik CSP başlıkları |
| **Rate Limiting** | Giriş, kayıt, kimlik doğrulama ve iletişim rotalarında istek sınırlama (bellek içi — serverless örnekler arasında paylaşılmaz) |
| **Güvenlik Başlıkları** | X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-Robots-Tag |
| **İçerik Güvenliği** | Uygun ARIA nitelikleriyle semantik HTML |
| **Ortam Güvenliği** | Hassas env dosyaları (`.env.local`, `.env.production`) versiyon kontrolünden hariç |
| **EXIF Temizleme** | Yüklenen görsellerdeki metadata gizlilik için kaldırılır (Sharp) |
| **Debug Uç Noktaları** | `/api/public/debug` ve `/api/public/create-admin` `development` modu dışında devre dışı |
| **Dosya Yükleme** | Dosya tipi, boyut kontrolü ve rate limiting ile güvenli yükleme |
| **CodeQL Taraması** | GitHub Actions ile günlük otomatik güvenlik analizi |
| **npm Audit** | CI/CD pipeline'ında otomatik bağımlılık güvenlik taraması |

---

## Performans ve SEO

### Performans Optimizasyonları
- **ISR (Incremental Static Regeneration):** `/tr/*` sayfaları build'de önceden üretilir (`●`) ve `revalidate` süresiyle arka planda tazelenir. Bunun için:
  - Kök layout `headers()` / `cookies()` okumaz (`<html lang="tr">` sabit) — aksi halde tüm rotalar dinamikleşir
  - `[lang]/layout.tsx` `generateStaticParams` + next-intl `setRequestLocale` çağırır — aksi halde next-intl locale'i istek başlığından okur
  - Haber detayları `force-dynamic` değil `revalidate = 3600`; admin kayıtları `revalidateFx()` ile tüm layout'u anında tazeler
- **Görsel Optimizasyon:** `next/image` (WebP, 30 gün `minimumCacheTTL`), LCP görsellerinde `priority` + `sizes`
- **Kod Bölme:** three.js sahneleri, 3D görüntüleyici ve galeri bileşenleri dinamik import ile ayrı chunk; framer-motion `LazyMotion`
- **Sorgu Sınırları:** Public portföy API'si en fazla 100 kayıt döner
- **Oturum:** `SessionProvider` pencere odağında oturumu yeniden çekmez
- **Sıkıştırma:** Sunucu tarafında gzip sıkıştırma aktif
- **Önbellek Stratejisi:** `unstable_cache` + etiket tabanlı geçersizleştirme (`fx-content`, `news-*`), bellek içi site ayarları önbelleği
- **Fontlar:** `next/font` ile kendi sunucusundan (Inter, Space Grotesk, JetBrains Mono — public; Barlow, Geist — admin); harici font bağlantısı yok
- **Bundle Analizi:** `ANALYZE=true npm run build` ile bundle görselleştirme

### SEO Özellikleri
- **Dinamik Sitemap:** `/sitemap.xml` — statik sayfalar + hizmet, yazılım, FX 3D, haber ve portföy detayları
- **Robots.txt:** `/robots.txt` — `/admin`, `/api/`, `/tr/account`, `/tr/login`, `/tr/register`, `/tr/offline` engellenir (`trailingSlash: false` ile uyumlu, eğik çizgisiz)
- **noindex:** Özel sayfalar (`login`, `register`, `account`, `offline`) ve bulunamayan haber/portföy kayıtları `robots: { index: false }`
- **Meta Yönetimi:** Her sayfa için başlık, açıklama, canonical ve Open Graph
- **JSON-LD:** Organization (site ayarlarındaki gerçek sosyal profiller + `logo.png`), WebSite, NewsArticle (boş alan ve e-posta içermez), sayfa bazında BreadcrumbList, hizmet listesi
- **Tek URL Kaynağı:** Tüm mutlak URL'ler `SITE_URL` (`src/lib/seo-utils.ts`) üzerinden
- **Eski Adresler:** Eski hizmet slug'ları ve `/es/*`, `/tr/noticias` adresleri 301 ile güncel karşılıklarına yönlenir

---

## PWA Desteği

Fixral CMS, Progressive Web App (PWA) olarak çalışabilir:

| Dosya | Konum | Açıklama |
|-------|-------|----------|
| `manifest.json` | `public/manifest.json` | Uygulama adı, ikonlar, kısayollar, ekran görüntüleri |
| `sw.js` | `public/sw.js` | Service Worker — çevrimdışı destek |
| `usePWA` | `src/hooks/usePWA.ts` | Service Worker kayıt hook'u |
| `PWAInstallPrompt` | `src/components/PWAInstallPrompt.tsx` | Yükleme istemi bileşeni |
| `offline` | `src/app/[lang]/offline/` | Çevrimdışı sayfası |

> Service Worker, Next.js RSC yüklerini (`?_rsc=`, `RSC` başlığı) ve `/_next/image` isteklerini önbelleğe almaz; böylece istemci tarafı gezinmede eski sayfa verisi gösterilmez. Önbellek sürümü (`CACHE_VERSION`) değiştiğinde eski önbellekler `activate` aşamasında silinir.

---

## Çoklu Dil (i18n)

### Yapılandırma
- **Kütüphane:** next-intl 4.8
- **Varsayılan Dil:** Türkçe (tr)
- **Desteklenen Diller:** Türkçe (tr)
- **Çeviri Dosyaları:** `messages/tr.json`
- **Yapılandırma:** `src/i18n/request.ts`

### URL Yapısı
```
www.fixral.com/tr/           → Türkçe anasayfa
www.fixral.com/tr/haberler   → Türkçe haberler
www.fixral.com/tr/portfolio  → Portföy
www.fixral.com/es/...        → 301 → /tr/... (kaldırılan İspanyolca adresler)
```

### Yerelleştirilmiş Rotalar
Proxy katmanı eski adresleri kalıcı olarak yönlendirir:
- `/es/...` → `/tr/...` (301; `/es/noticias` → `/tr/haberler`)
- `/tr/noticias` → `/tr/haberler` (301)

Dil seçici, veritabanında aktif kalmış olsa bile rotası olmayan dilleri (`src/i18n.ts` → `locales` dışındakileri) göstermez.

---

## Proxy Katmanı

`src/proxy.ts` dosyası (Next.js 16'da `middleware.ts`'nin yeni konumu) aşağıdaki işlevleri yerine getirir:

1. **Dil Yönlendirme:** Dil ön eki olmayan URL'leri varsayılan dile yönlendirir
2. **Yerelleştirilmiş Rota Takma Adları:** Dile özel URL çevirmesi
3. **Sayfa Erişim Kontrolü:** Veritabanından sayfa aktiflik durumunu kontrol eder (1 dakika önbellek)
4. **Admin Koruması:** `/admin/*` yolları için JWT tabanlı kimlik doğrulama
5. **Admin API Koruması:** `/api/admin/*` yolları için admin JWT doğrulaması
6. **Kötü Amaçlı İstek Engelleme:** Şüpheli URL desenleri ve User-Agent'lar için 403
7. **Rate Limiting:** Giriş, kayıt ve kimlik doğrulama rotalarında istek sınırlama
8. **Güvenlik Başlıkları:** CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
9. **Önbellek Kontrolleri:** Admin/API için `no-store` ve `X-Robots-Tag: noindex, nofollow`; herkese açık sayfalara indeksleme başlığı eklenmez (sayfa bazlı `noindex` metadata'sı geçerli olur)

---

## Test

Proje Jest 30 ve Testing Library kullanır:

```bash
# Tüm testleri çalıştır
npm test

# İzleme modunda
npm run test:watch

# Kapsam raporu ile
npm run test:coverage
```

### Test Yapılandırması
- **Ortam:** jsdom (jest-environment-jsdom)
- **Yol Alias'ları:** `@/*` → `./src/*`
- **Mevcut Testler:** `src/lib/__tests__/` altında — `seo-utils`, `rate-limit`, `validation`, `fx-data` (6 suite, 71 test)

---

## Değişiklik Günlüğü

### v5.2.1 — Asıl Domain: www.fixral.com
- **Sitemap / Search Console:** Üretimde `NEXT_PUBLIC_APP_URL` ve `NEXTAUTH_URL` `https://www.fixral.com` yapıldı; sitemap, robots, canonical ve JSON-LD artık `fixral-cms.vercel.app` yerine asıl domain'i gösterir ("Bu URL'ye, bu yerdeki bir Site Haritası için izin verilmiyor" hatası giderildi)
- **Yinelenen İçerik:** `fixral-cms.vercel.app` üzerindeki sayfa istekleri proxy'de 308 ile `www.fixral.com`'a yönlenir (`/api` hariç)
- **Env Sync:** `scripts/sync-vercel-env.mjs` `NEXTAUTH_URL` ve `NEXT_PUBLIC_APP_URL` değerlerini üretim domain'iyle ezer

### v5.2.0 — FIXRAL Web 2026 Yeniden Tasarımı, Güvenlik Sertleştirme, ISR ve SEO Denetimi

**Yeniden tasarım (public site)**
- FIXRAL marka sistemi: koyu varsayılan tema, Fixral Turuncu `#F97316`, Space Grotesk · Inter · JetBrains Mono, "teknik resim paftası" görsel dili; header `sticky` 64px
- Yeni anasayfa: hizmet şeridi, disiplin dizini, kaydırmaya bağlı three.js süreç sahnesi (nokta bulutu → tel kafes → sapma haritası → katmanlı baskı), yazılımlar, teslimat örnekleri, haber + video şeridi, kısa teklif formu
- Yeni yüzeyler: `/tr/services/[slug]` (8 hizmet), `/tr/software` + `[slug]`, `/tr/fx-3d` + `[slug]` (Cults3D); iletişimde 4 adımlı teklif formu; Ctrl+K arama hizmet/yazılım kataloğunu da kapsar
- Yeni admin sayfaları: Site İçeriği, Yazılımlar, FX 3D (38 sayfa); yeni API'ler: `admin/fx-content`, `admin/fx-3d`, `admin/videos/bulk-status`, `public/fx-data`
- FX veri katmanı (`fx-data-server`, `fx-revalidate`): admin kayıtları site önbelleğini anında tazeler
- İspanyolca (`es`) kaldırıldı; site tek dilli. `/es/*`, `/tr/noticias` ve eski 8 hizmet slug'ı 301 ile yönlenir
- Marka varlıkları (`brand/`, `public/brand/`, `public/logo.png`), yenilenen favicon/PWA ikonları ve OG görseli

**Güvenlik**
- *Kritik:* `api/public/` altındaki yazma uç noktaları yalnızca oturum kontrolü yapıyordu; kayıt herkese açık olduğundan her kullanıcı haber oluşturup/silebiliyor, toplu haber işlemi yapabiliyor, hizmet ve iletişim bilgilerini değiştirebiliyor, mesaj güncelleyebiliyor ve AI metadata ucunu kullanabiliyordu. Tümüne `role === 'admin'` şartı eklendi; taslak haberler yalnızca admin'e görünür
- Haber gövdesi sunucuda `sanitize-html` ile temizlenir (stored XSS); JSON-LD çıktılarında `<` kaçışlanır
- Cron uç noktaları yalnızca `CRON_SECRET` ile çalışır (taklit edilebilir `x-vercel-cron` başlığı kabul edilmez)
- Kullanılmayan, şifresiz e-posta değiştiren `POST /api/public/settings/email` kaldırıldı

**Performans**
- Kök layout'taki `headers()` çağrısı ve next-intl'in başlıktan locale okuması tüm public sayfaları dinamikleştiriyordu; kaldırıldı/düzeltildi — `/tr/*` sayfaları artık ISR (`●`)
- Haber detayı `force-dynamic` → `revalidate = 3600`
- Portföy API'sinde sınırsız sorgu (adapter `$sample` desteklemiyordu) → en fazla 100 kayıt
- Service Worker RSC yüklerini ve `/_next/image`'ı önbelleğe almıyor; `CACHE_VERSION` 1.0.2
- `SessionProvider` odakta yeniden çekmiyor; kullanılmayan Google Fonts preconnect'leri kaldırıldı; videolar sayfası kendi API'sine HTTP yerine doğrudan veritabanından okuyor

**SEO**
- Eski domain'i gösteren statik `public/sitemap.xml` kaldırıldı (dinamik sitemap'i gölgeliyordu); `vercel.json`'daki var olmayan `/api/sitemap` ve `/api/robots` rewrite'ları silindi
- `robots.ts` eğik çizgi uyumsuzluğu nedeniyle özel sayfaları engellemiyordu — düzeltildi, `/tr/offline` eklendi
- Özel sayfalar ve bulunamayan haber/portföy kayıtları `noindex`; proxy'nin her sayfaya bastığı `X-Robots-Tag: index, follow` kaldırıldı
- Organization/WebSite JSON-LD: geçersiz `sameAs` ve çalışmayan SearchAction kaldırıldı, gerçek sosyal profiller ve `logo.png`; NewsArticle'dan yazar e-postası ve boş alanlar çıkarıldı
- Hatalı ("Tr" düğümlü) ve sayfalarda çift basılan global breadcrumb kaldırıldı; videolar breadcrumb'ı mutlak URL
- Tüm mutlak URL'ler `SITE_URL`'den; manifest adı/açıklaması güncellendi, `start_url` `/tr`

**Yapı**
- Kullanılmayan dosyalar kaldırıldı: `seo-service`, `jwt-middleware`, `api-middleware`, `advanced-logger`, `error-utils`, `image-optimizer`, `image-validation`, `StructuredData`, `GlobalBreadcrumbsJsonLd`, `portfolio/layout-with-schema`, `app/metadata`
- **Doğrulama:** `tsc --noEmit` temiz, ESLint 0 hata, Jest 71/71, `next build` başarılı

### v5.1.3 — Depo Temizliği ve Tema Sistemi Bağımsızlaştırma
- **Depo Temizliği:** QA ekran görüntüsü artıkları (`.qa-baseline/`, `.qa-after/`, `.qa-admin-tmp/`), kök dizindeki geçici/referans PNG dosyaları (`thingiverse-*.png`, `tmp-services-*.png`) ve `scripts/qa-after-screenshots.mjs` kaldırıldı
- **Bağımlılıklar:** Artık kullanılmayan `playwright` devDependency'si ve `qa:after` npm script'i kaldırıldı
- **Tema Sistemi:** `next-themes` bağımlılığı kaldırıldı; public taraf `public-theme` yardımcıları, admin tarafı `AdminThemeProvider` ile tamamen özel implementasyona geçti

### v5.1.2 — Vercel Domain Geçişi ve Ortam Değişkeni Senkronizasyonu
- **Domain Geçişi:** Production adresi `fixral-cms.vercel.app` olarak güncellendi; `vercel.json`'dan eski özel domain alias'ları kaldırıldı
- **Ortam Değişkenleri:** `NEXT_PUBLIC_APP_URL` tanıtıldı (SEO/canonical URL'ler bu değişkenden beslenir); `scripts/sync-vercel-env.mjs` ile `.env.local` → Vercel tek komut senkronizasyonu eklendi
- **Tema Token'ları:** Kalan sabit renk sınıfları (`bg-gray-900`, `to-blue-100` vb.) semantik token'lara (`bg-card`, `to-muted` vb.) taşındı

### v5.1.1 — Next.js 16 Yükseltmesi, Precision Tasarım Dili ve Kod Kalitesi Denetimi
- **Platform Yükseltmesi:** Next.js 16.2 + React 19.2 geçişi (Turbopack varsayılan derleyici); `middleware.ts` yeni `src/proxy.ts` konumuna taşındı
- **Tailwind v4:** CSS-first yapılandırmaya geçiş — `tailwind.config.js` kaldırıldı, token'lar `globals.css`'e taşındı
- **Precision Engineering Tasarım Dili:** Birleşik token/tema sistemi, blueprint grid, teknik etiketler ve ölçü çizgileri primitifleri; anasayfa, header/footer ve public alt sayfaların yeniden tasarımı
- **Kod Kalitesi Denetimi:** ESLint hataları 133 → 0; React Compiler uyumluluğu için ~30 dosyada modernizasyon (`useSyncExternalStore`, türetilmiş durum, render-time adjustment kalıpları)
- **ESLint Yapılandırması:** ESLint 9 flat config; React Compiler danışmanlık kuralları uyarı seviyesinde, CommonJS script/config dosyaları için override blokları
- **Doğrulama:** `tsc --noEmit` temiz, `next build` 105/105 sayfa başarılı

### v5.1.0 — Premium UI/UX Yenilemesi ve Mimari Temizlik
- **Tasarım Sistemi:** Token tabanlı tema mimarisi güncellendi; public ve admin tarafında tutarlı tasarım dili
- **Admin Panel Modernizasyonu:** Komut paleti, veri araç çubuğu (`DataToolbar`), boş durum bileşenleri (`EmptyState`), form bölümleri ve iskelet yükleme durumları eklendi
- **Medya Kütüphanesi:** Cloudinary klasör ağacı navigasyonu (`MediaFolderTree` + `media-folders` kütüphanesi) — klasör bazlı gezinme ve filtreleme
- **Erişilebilirlik ve Hareket:** `MotionProvider` ile LazyMotion tabanlı animasyon altyapısı, `prefers-reduced-motion` desteği; WCAG kontrast test scripti (`scripts/contrast-test.js`)
- **Legacy Temizlik:** `Fixral*` özel bileşen seti, `_legacy` UI bileşenleri, eski `AdminLayout`/`PublicLayout` şablonları, `ThemeContext`, `mongoose`, `redis-cache` ve `cache-manager` kaldırıldı
- **Sayfa Temizliği:** `admin/monitoring`, `admin/editor`, `admin/updates` ve `admin/theme-customize` sayfaları kaldırıldı (34 admin sayfası)
- **Yapısal Değişiklik:** `middleware.ts` proje kökünden `src/middleware.ts` konumuna taşındı
- **Yeni Servisler:** `site-settings` kütüphanesi ile merkezi site ayarları erişimi; `ThemeScope` ve `PublicToaster` bileşenleri
- **Slider:** Medya kütüphanesi entegrasyonu ve form/API düzeltmeleri

### v5.0.2 — Yedekleme Sistemi Düzeltmesi ve Hata Gidermeler
- **Düzeltme:** Export API artık her zaman geçerli ZIP dosyası döndürür (bozuk ZIP sorunu giderildi)
- **Düzeltme:** Import API artık FormData ile gönderilen ZIP dosyalarını doğru şekilde işler
- **Düzeltme:** News API başlık doğrulaması — çevirilerden başlık çıkarma
- **Düzeltme:** Dashboard istatistik API'si — `isActive` alan uyumsuzluğu giderildi
- **Düzeltme:** Tiptap duplicate extension uyarısı ve public services hatası
- **Düzeltme:** Admin panel CRUD yapısal hataları — yanlış API endpoint kullanımı, slug otomatik üretimi, `connectDB()` eksikleri
- **Yeni:** Tam Yedek (DB + Medya) ve Sadece DB olmak üzere iki yedekleme seçeneği
- **Yeni:** ZIP ve JSON formatlarını destekleyen içe aktarma
- **Yeni:** Medya manifest dosyası (`media_manifest.json`) yedekleme ZIP'ine eklendi

### v5.0.1 — Yeniden Markalama ve Güvenlik Sertleştirme
- **Yeniden Markalama:** Tüm "Personal Blog" referansları "Fixral CMS" ile değiştirildi — JWT token'ları, PWA manifest, service worker, yapılandırma varsayılanları, Swagger belgeleri, 2FA TOTP ve CI pipeline genelinde
- **Güvenlik:** `.env.production` git takibinden çıkarıldı; sabit kodlanmış JWT yedek gizli anahtarları kaldırıldı
- **Cloudinary:** Medya klasör ön ekini kaynak kodundan ayırmak için `CLOUDINARY_FOLDER` ortam değişkeni tanıtıldı
- **Temizlik:** Eski lint çıktı dosyaları, iç içe `.next` önbellek artıkları kaldırıldı ve `.gitignore` güncellendi
- **Paket:** `fixral-cms` paket kimliği ile `package-lock.json` yeniden oluşturuldu

### v5.0.0 — Prisma Geçişi ve shadcn/ui Yeniden Tasarımı
- **Veritabanı Geçişi:** MongoDB'den PostgreSQL'e (Neon) geçiş — Prisma ORM ile
- **Admin Panel Yeniden Tasarımı:** shadcn/ui bileşen kütüphanesine (Radix + Tailwind) tam geçiş
- **E-Ticaret Kaldırıldı:** Ürün kataloğu, sepet, ödeme ve sipariş yönetimi kaldırıldı
- **Plugin/Tema Sistemleri Kaldırıldı:** PluginRegistry ve ThemeRegistry kaldırılarak mimari sadeleştirildi
- **Yeni Admin Sayfaları:** Analitik paneli, SEO yönetimi, Sosyal medya ayarları, Tema özelleştirme
- **Zengin Metin Editörü:** Tiptap entegrasyonu — tablolar, kod blokları, görseller ve metin hizalama
- **Katlanabilir Kenar Çubuğu:** shadcn/ui sidebar ile gruplandırılmış navigasyon bölümleri
- **Yeni UI Bileşenleri:** GlassCard, MagneticButton, ScrollReveal, SectionWrapper, EyebrowTag

### v4.3.0 — Proje Temizliği ve CI/CD Optimizasyonu
- Başıboş derleme artıkları ve iç içe `.next` dizinleri kaldırıldı
- Geçici migration scriptleri kaldırıldı
- `.gitignore` kapsamlı kalıplarla güncellendi
- CI/CD pipeline sadeleştirildi
- Node.js ön koşulu v20'ye güncellendi

### v4.2.0 — Dinamik Site Ayarları ve SEO
- Veritabanından dinamik `<title>` ve `<meta description>`
- Navigasyonda marka adı için `SiteSettings`'te yeni `logoText` alanı
- Veritabanından dinamik JSON-LD yapılandırılmış veri

### v4.1.0 — Modern Navigasyon ve İkon Yönetimi
- Framer-motion kayan aktif göstergesi ile masaüstü navigasyon yeniden tasarımı
- HeadlessUI Dialog ile mobil navigasyon kayan çekmece
- Görsel Heroicons grid ile admin ikon seçici

### v4.0.0 — UI/UX Mimari Refaktörü
- Token tabanlı tasarım sistemi (CSS değişkenleri, Tailwind yapılandırması, TypeScript token'ları)
- CVA destekli atomik bileşenler
- Tam semantik HTML geçişi
- ESLint `jsx-a11y/recommended` zorunluluğu

### v3.7.0 — Modüler Mimari
- `[lang]` dinamik segmentleri ile tam i18n entegrasyonu
- API uç noktaları `public/` ve `admin/` olarak ayrıldı
- Portföy sayfaları için SSR geçişi

---

## Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: yeni özellik açıklaması'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

### Commit Mesaj Kuralları

```
feat: yeni özellik
fix: hata düzeltmesi
docs: dokümantasyon değişikliği
style: kod formatı değişikliği
refactor: yeniden yapılandırma
test: test ekleme/güncelleme
chore: bakım işleri
```

---

## Lisans

Bu proje özel yazılımdır. Tüm hakları saklıdır. İzinsiz kopyalama, dağıtma veya değiştirme kesinlikle yasaktır.

**Geliştirici:** Erdem Erciyas
**Depo:** [github.com/erdemerciyas/fixral-cms](https://github.com/erdemerciyas/fixral-cms)
**Web Sitesi:** [www.fixral.com](https://www.fixral.com)
