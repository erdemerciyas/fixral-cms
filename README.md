# Fixral CMS

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Radix-000?style=for-the-badge)](https://ui.shadcn.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![Sürüm](https://img.shields.io/badge/Sürüm-5.0.0-blue?style=for-the-badge)]()
[![Lisans](https://img.shields.io/badge/Lisans-Özel-red?style=for-the-badge)]()

**Fixral CMS**, Next.js 14 (App Router), Prisma ORM ve PostgreSQL üzerine inşa edilmiş, üretime hazır, tam kapsamlı bir İçerik Yönetim Sistemidir.

Mühendislik portföyleri, 3D baskı hizmetleri ve ajans web siteleri için tasarlanmış olup; shadcn/ui ile güçlendirilmiş modern admin paneli, çoklu dil desteği ve zengin içerik düzenleme deneyimi sunar.

---

## İçindekiler

- [Temel Özellikler](#temel-özellikler)
- [Mimari](#mimari)
- [Teknoloji Yığını](#teknoloji-yığını)
- [UI Bileşen Kütüphanesi](#ui-bileşen-kütüphanesi)
- [Proje Yapısı](#proje-yapısı)
- [Kurulum](#kurulum)
- [Ortam Değişkenleri](#ortam-değişkenleri)
- [Komutlar](#komutlar)
- [Yayınlama (Deployment)](#yayınlama-deployment)
- [Güvenlik](#güvenlik)
- [Değişiklik Günlüğü](#değişiklik-günlüğü)
- [Lisans](#lisans)

---

## Temel Özellikler

### İçerik Yönetimi
- **Portföy Yönetimi:** Resim galerileri, 3D model görüntüleyici (GLB/GLTF/STL), kategoriler ve etiketler ile zengin proje vitrinleri
- **Haber / Blog:** Çoklu dil destekli haber makaleleri, SEO meta verileri, slug tabanlı yönlendirme ve zengin metin editörü (Tiptap)
- **Hizmetler Modülü:** Mühendislik hizmetleri için özel sayfa yapıları (Tersine Mühendislik, 3D Tarama vb.)
- **Slider Yönetimi:** Anasayfa hero slider'ları, sürükle-bırak medya yönetimi ile
- **Video Yönetimi:** YouTube entegrasyonu ve otomatik kanal senkronizasyonu
- **Kategori Yönetimi:** Haber ve portföy içerikleri için esnek kategori sistemi

### Admin Paneli
- **Modern Arayüz:** shadcn/ui (Radix primitives + Tailwind) ile tam donanımlı, katlanabilir kenar çubuğu navigasyonu
- **Zengin Metin Editörü:** Tiptap tabanlı editör — tablolar, kod blokları, görseller ve metin hizalama desteği
- **Medya Tarayıcısı:** Cloudinary destekli sürükle-bırak görsel yükleme, galeri görünümü
- **Mesaj Merkezi:** İletişim formları ve proje sorgulamalarına doğrudan panelden yanıt verme
- **Yedekleme Sistemi:** Tam kapsamlı ZIP yedekleme (veritabanı + Cloudinary medya dosyaları) ve geri yükleme
- **SEO Yönetimi:** Sayfa bazlı meta başlıklar, açıklamalar, canonical URL'ler ve Open Graph ayarları
- **Analitik Paneli:** Site geneli istatistikler ve içerik metrikleri
- **Tema Özelleştirme:** Canlı renk ve marka kontrolleri
- **Site Ayarları:** Logo, slogan, iletişim bilgileri, sosyal medya bağlantıları
- **Sayfa Yönetimi:** Navigasyon sıralaması, sayfa görünürlüğü ve buton yapılandırması
- **Footer Ayarları:** Alt bilgi alanı içerik ve görünürlük yönetimi

### Çoklu Dil (i18n)
- **Tam i18n Desteği:** Tüm herkese açık sayfalar `[lang]` dinamik segmentleri altında `next-intl` ile
- **Desteklenen Diller:** Türkçe (tr), İspanyolca (es)
- **Admin Dil Sekmeleri:** Her dil için yan yana içerik düzenleme

### Portföy ve 3D Görselleştirme
- **3D Model Görüntüleyici:** Tarayıcı içi GLB/GLTF/STL model desteği — `@react-three/fiber` ile
- **Resim Galerisi:** Lightbox tarzı galeriler — yakınlaştırma, gezinme ve küçük resim şeritleri
- **Gelişmiş Filtreleme:** Kategori filtreleri, arama, sıralama ve sayfalama

### SEO ve Performans
- **ISR Önbellekleme:** Hızlı TTFB için Incremental Static Regeneration
- **Dinamik Sitemap ve Robots.txt:** Veritabanından güncel bağlantılarla otomatik oluşturma
- **Canonical URL Yönetimi:** Sayfa bazında bağımsız canonical URL üretimi
- **Hreflang Etiketleri:** Çoklu dil SEO desteği ile hreflang alternate bağlantıları
- **JSON-LD:** Veritabanından dinamik yapılandırılmış veri (structured data)
- **PWA Desteği:** Service Worker, manifest.json ve çevrimdışı sayfa

---

## Mimari

```
Next.js 14 App Router
├── Server Components (SSR veri çekme)
├── Client Components (shadcn/ui ile etkileşimli arayüz)
├── API Routes (public/ + admin/ ayrımı)
├── Middleware (kimlik doğrulama, i18n, rate limiting)
├── Prisma ORM (PostgreSQL / Neon)
└── Prisma Model Adapter (Mongoose-uyumlu API katmanı)
```

### Temel Mimari Kararlar
- **Prisma ORM:** Tüm veritabanı işlemleri PostgreSQL (Neon) üzerinden Prisma ile yönetilir. Mongoose-uyumlu bir adapter katmanı (`prisma-model-adapter`) sayesinde mevcut kod tabanı sorunsuz çalışır
- **API Ayrımı:** `api/public/` kimlik doğrulaması gerektirmeyen uç noktalar, `api/admin/` korumalı uç noktalar için
- **Admin Arayüzü:** shadcn/ui bileşenleri (Radix + Tailwind) ile katlanabilir kenar çubuğu düzeni
- **Bileşen Stratejisi:** shadcn/ui temel bileşenleri + özel Fixral bileşenleri
- **Sayfa Şablonları:** Breadcrumb'lar ve tutarlı aralıklama ile yeniden kullanılabilir admin sayfa düzeni

---

## Teknoloji Yığını

| Kategori | Teknoloji |
|----------|-----------|
| **Framework** | Next.js 14.2 (React 18 + App Router) |
| **Dil** | TypeScript 5.6 |
| **Veritabanı** | PostgreSQL (Neon) — Prisma ORM ile |
| **Stillendirme** | Tailwind CSS 3.4, CVA, tailwind-merge |
| **UI Kütüphanesi** | shadcn/ui (Radix UI primitives) |
| **Zengin Metin** | Tiptap (kod blokları, tablolar, görseller ile) |
| **Animasyon** | Framer Motion |
| **İkonlar** | Lucide React, Heroicons, Phosphor Icons |
| **3D Grafik** | Three.js, React Three Fiber, Drei |
| **Kimlik Doğrulama** | NextAuth.js + JWT |
| **Medya** | Cloudinary (görsel yükleme, dönüştürme, CDN) |
| **Çoklu Dil** | next-intl |
| **E-posta** | Nodemailer (Gmail SMTP) |
| **Test** | Jest, Testing Library |
| **Lint / Format** | ESLint, Prettier |
| **CI/CD** | GitHub Actions, Vercel |
| **Bildirimler** | Sonner (toast), SweetAlert2 |
| **Slider** | Swiper.js |
| **Veri Çekme** | SWR |

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

**Özel Bileşenler:** `GlassCard`, `MagneticButton`, `ScrollReveal`, `SectionWrapper`, `EyebrowTag`, `GrainOverlay`, `UniversalEditor`, `Pagination`, `MediaBrowser`, `ImageUpload`, `PortfolioImageGallery`

---

## Proje Yapısı

```
src/
├── app/
│   ├── [lang]/                  # i18n herkese açık sayfalar (tr, es)
│   │   ├── page.tsx             # Anasayfa
│   │   ├── portfolio/           # Portföy vitrini
│   │   │   └── [slug]/          # Portföy detay sayfası
│   │   ├── services/            # Hizmet listeleme
│   │   ├── haberler/            # Haberler (Türkçe)
│   │   │   └── [slug]/          # Haber detay sayfası
│   │   ├── noticias/            # Haberler (İspanyolca)
│   │   │   └── [slug]/          # Haber detay sayfası
│   │   ├── contact/             # İletişim formu
│   │   ├── account/             # Kullanıcı hesabı
│   │   ├── videos/              # Video galerisi
│   │   ├── login/               # Giriş sayfası
│   │   ├── register/            # Kayıt sayfası
│   │   └── offline/             # Çevrimdışı sayfası (PWA)
│   ├── admin/                   # Admin panel sayfaları
│   │   ├── dashboard/           # Admin kontrol paneli
│   │   ├── analytics/           # Analitik paneli
│   │   ├── news/                # Haber yönetimi (oluştur/düzenle/listele)
│   │   ├── portfolio/           # Portföy yönetimi (oluştur/düzenle/listele)
│   │   ├── services/            # Hizmet yönetimi
│   │   ├── categories/          # Kategori yönetimi
│   │   ├── models/              # 3D model yönetimi
│   │   ├── media/               # Medya kütüphanesi (Cloudinary)
│   │   ├── slider/              # Slider yönetimi
│   │   ├── videos/              # Video yönetimi
│   │   ├── messages/            # İletişim mesajları
│   │   ├── content/             # İçerik ayarları
│   │   ├── pages/               # Sayfa yönetimi
│   │   ├── editor/              # Sayfa editörü
│   │   ├── seo/                 # SEO ayarları
│   │   ├── social-media/        # Sosyal medya bağlantıları
│   │   ├── theme-customize/     # Tema özelleştirme
│   │   ├── site-settings/       # Site yapılandırması
│   │   ├── footer/              # Footer ayarları
│   │   ├── settings/            # Genel ayarlar
│   │   ├── languages/           # Dil yönetimi
│   │   ├── users/               # Kullanıcı yönetimi (oluştur/düzenle)
│   │   ├── backup/              # Yedekleme ve geri yükleme
│   │   ├── profile/             # Admin profili ve 2FA
│   │   ├── monitoring/          # Performans izleme
│   │   ├── updates/             # Güncellemeler
│   │   ├── sitemap/             # Sitemap yönetimi
│   │   └── login/               # Admin giriş sayfası
│   ├── api/
│   │   ├── public/              # Kimlik doğrulamasız API uç noktaları
│   │   │   ├── news/            # Haber API (liste, detay)
│   │   │   ├── portfolio/       # Portföy API
│   │   │   ├── services/        # Hizmet API
│   │   │   ├── settings/        # Site ayarları API
│   │   │   ├── contact/         # İletişim formu API
│   │   │   ├── categories/      # Kategori API
│   │   │   ├── slider/          # Slider API
│   │   │   ├── videos/          # Video API
│   │   │   └── 3dmodels/        # 3D Model API
│   │   └── admin/               # Korumalı API uç noktaları
│   │       ├── backup/          # Yedekleme dışa/içe aktarma
│   │       ├── upload/          # Dosya yükleme (Cloudinary)
│   │       ├── news/            # Haber CRUD
│   │       ├── portfolio/       # Portföy CRUD
│   │       ├── services/        # Hizmet CRUD
│   │       ├── slider/          # Slider CRUD
│   │       ├── media/           # Medya yönetimi
│   │       ├── 2fa/             # İki faktörlü doğrulama
│   │       └── ...              # Diğer admin API'ler
│   ├── globals.css              # CSS değişkenleri ve genel stiller
│   └── layout.tsx               # Kök düzen
├── components/
│   ├── ui/                      # shadcn/ui + özel bileşenler
│   ├── admin/                   # Admin'e özel bileşenler (sidebar, header, nav)
│   ├── home/                    # Anasayfa bileşenleri
│   ├── portfolio/               # Portföy bileşenleri
│   ├── news/                    # Haber bileşenleri
│   ├── layout/                  # Navigasyon, TopBar, Footer
│   └── common/                  # Paylaşılan bileşenler
├── core/
│   └── lib/                     # Logger ve çekirdek yardımcı araçlar
├── hooks/                       # Özel React hook'ları
├── lib/                         # Prisma istemcisi, Cloudinary, auth, yardımcı araçlar
│   ├── prisma.ts                # Prisma istemci bağlantısı
│   ├── prisma-model-adapter.ts  # Mongoose-uyumlu Prisma adapter katmanı
│   ├── auth.ts                  # NextAuth yapılandırması
│   ├── cloudinary.ts            # Cloudinary yapılandırması ve yardımcılar
│   └── mongoose.ts              # Prisma bağlantı wrapper'ı (uyumluluk katmanı)
├── models/                      # Prisma model adapter'ları (Mongoose-uyumlu API)
├── prisma/
│   ├── schema.prisma            # Veritabanı şeması
│   └── seed.mjs                 # Başlangıç veri beslemesi
├── messages/                    # i18n çeviri dosyaları (tr.json, es.json)
├── types/                       # TypeScript tip tanımları
└── styles/                      # Tasarım token'ları
```

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

# 5. Başlangıç verilerini yükleyin (isteğe bağlı)
npm run db:seed

# 6. Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

Admin paneline erişim: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## Ortam Değişkenleri

Proje kökünde bir `.env.local` dosyası oluşturun:

```bash
# Veritabanı (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-xxxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://user:password@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require

# Uygulama Yapılandırması
APP_NAME=Fixral
APP_URL=http://localhost:3000

# Kimlik Doğrulama (ZORUNLU)
NEXTAUTH_SECRET=your-nextauth-secret        # openssl rand -hex 32 ile üretilebilir
NEXTAUTH_URL=http://localhost:3000

# Cloudinary (Görsel Yükleme)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Gmail SMTP (E-posta Gönderimi)
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password   # Google Uygulama Şifresi

# YouTube API (Video Senkronizasyonu)
YOUTUBE_API_KEY=your-youtube-api-key

# Güvenlik
RATE_LIMIT_MAX=100                           # Pencere başına maks. istek
RATE_LIMIT_WINDOW=900000                     # Rate limit penceresi (ms)

# Vercel (Üretim)
VERCEL_URL=your-vercel-url
```

> **Uyarı:** `.env.local` veya `.env.production` dosyalarını asla versiyon kontrolüne eklemeyin. Şablon olarak `.env.example` dosyasını kullanın.

---

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusunu başlat |
| `npm run build` | Üretim derlemesi oluştur |
| `npm start` | Üretim sunucusunu başlat |
| `npm run lint` | ESLint ile kod kontrolü yap |
| `npm run lint:fix` | Lint sorunlarını otomatik düzelt |
| `npm test` | Jest testlerini çalıştır |
| `npm run test:watch` | Testleri izleme modunda çalıştır |
| `npm run test:coverage` | Testleri kapsam raporu ile çalıştır |
| `npm run type-check` | TypeScript tip kontrolü yap |
| `npm run clean` | .next ve out dizinlerini temizle |
| `npm run format` | Prettier ile kodu formatla |
| `npm run prisma:generate` | Prisma istemcisini oluştur |
| `npm run prisma:migrate` | Prisma migration'ları çalıştır |
| `npm run prisma:push` | Şemayı veritabanına gönder |
| `npm run db:seed` | Veritabanını başlangıç verileriyle doldur |
| `npm run deploy` | Vercel'e üretim deploy'u yap |
| `npm run deploy:preview` | Vercel'e önizleme deploy'u yap |
| `npm run sync-videos` | YouTube videolarını senkronize et |
| `npm run security:check` | npm güvenlik denetimi çalıştır |
| `npm run perf:analyze` | Bundle analizi ile build yap |
| `npm run health:check` | Sağlık kontrolü endpoint'ini test et |

---

## Yayınlama (Deployment)

### Vercel (Önerilen)

```bash
# Üretim deploy'u
npm run deploy

# Önizleme deploy'u
npm run deploy:preview
```

Vercel dashboard'unda tüm ortam değişkenlerinin yapılandırıldığından emin olun. PostgreSQL veritabanının (Neon) Vercel ağından erişilebilir olması gerekir.

#### Vercel Yapılandırma Notları
- `vercel-build` scripti otomatik olarak `prisma generate && next build` çalıştırır
- Node.js 20 çalışma zamanı önerilir
- Serverless function timeout limitleri uzun işlemler için (yedekleme vb.) dikkat edilmelidir

### CI/CD Pipeline

Proje, bir GitHub Actions CI/CD pipeline'ı içerir (`.github/workflows/ci.yml`):

1. **Kod Kalitesi** — ESLint, TypeScript tip kontrolü, güvenlik denetimi
2. **Derleme** — Ortam yedekleriyle üretim derlemesi
3. **Deploy** — `main` branch'e push edildiğinde otomatik Vercel deploy'u

#### Gerekli GitHub Secrets

| Secret | Açıklama |
|--------|----------|
| `VERCEL_TOKEN` | Vercel kimlik doğrulama token'ı |
| `VERCEL_ORG_ID` | Vercel organizasyon ID'si |
| `VERCEL_PROJECT_ID` | Vercel proje ID'si |
| `NEXTAUTH_SECRET` | NextAuth gizli anahtarı |
| `DATABASE_URL` | PostgreSQL bağlantı dizesi |

---

## Yedekleme Sistemi

Admin panelinden (**Admin > Yedekleme**) tam kapsamlı site yedekleme ve geri yükleme yapılabilir.

### Dışa Aktarma (Export)
- **Tam Yedek (DB + Medya):** Tüm veritabanı kayıtları + Cloudinary'den indirilen medya dosyaları tek bir ZIP dosyasında
- **Sadece Veritabanı:** Medya URL'leri korunur, dosyalar indirilmez (hızlı yedekleme)
- ZIP dosyası içeriği: `backup_data.json` (tüm koleksiyonlar) + `media/` klasörü (görseller) + `media_manifest.json` (medya listesi)

### İçe Aktarma (Import)
- Hem `.zip` hem `.json` formatını destekler
- ZIP dosyası yüklendiğinde otomatik olarak açılır ve `backup_data.json` okunur
- Mevcut kayıtlar güncellenir, yeni kayıtlar oluşturulur (upsert mantığı)

### Yedeklenen Veriler
Haberler, Portföyler, Hizmetler, Slider'lar, Kategoriler, Videolar, Kullanıcılar (şifreler hariç), Mesajlar, Site Ayarları, Footer Ayarları, İçerik Ayarları, Sayfa Ayarları, Genel Ayarlar, Hakkında ve İletişim bilgileri

---

## Güvenlik

| Önlem | Açıklama |
|-------|----------|
| **Veri Doğrulama** | Tüm API uç noktalarında Zod şemaları |
| **XSS Koruması** | DOMPurify + sanitize-html ile kullanıcı içeriği temizleme |
| **Kimlik Doğrulama** | NextAuth.js — JWT stratejisi ve rol tabanlı erişim kontrolü |
| **2FA Desteği** | Admin hesapları için TOTP tabanlı iki faktörlü doğrulama |
| **JWT Güçlendirme** | Yedek gizli anahtar yok; açıkça `NEXTAUTH_SECRET` yapılandırması gerekli |
| **Middleware Güvenliği** | IP engelleme, rate limiting ve yetkilendirme kontrolleri |
| **API Ayrımı** | Herkese açık ve admin API rotaları bağımsız auth guard'larla |
| **İçerik Güvenliği** | Uygun ARIA nitelikleriyle semantik HTML |
| **Ortam Güvenliği** | Hassas env dosyaları (`.env.local`, `.env.production`) versiyon kontrolünden hariç |
| **EXIF Temizleme** | Yüklenen görsellerdeki metadata gizlilik için kaldırılır |
| **Debug Uç Noktaları** | `/api/public/debug` ve `/api/public/create-admin` `development` modu dışında devre dışı |
| **Dosya Yükleme** | Dosya tipi, boyut kontrolü ve rate limiting ile güvenli yükleme |

---

## Değişiklik Günlüğü

### v5.0.2 — Yedekleme Sistemi Düzeltmesi
- **Düzeltme:** Export API artık her zaman geçerli ZIP dosyası döndürür (bozuk ZIP sorunu giderildi)
- **Düzeltme:** Import API artık FormData ile gönderilen ZIP dosyalarını doğru şekilde işler
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

## Lisans

Bu proje özel yazılımdır. Tüm hakları saklıdır. İzinsiz kopyalama, dağıtma veya değiştirme kesinlikle yasaktır.

**Geliştirici:** Erdem Erciyas
**Depo:** [github.com/erdemerciyas/fixral-cms](https://github.com/erdemerciyas/fixral-cms)
**Web Sitesi:** [fixral.com](https://www.fixral.com)
