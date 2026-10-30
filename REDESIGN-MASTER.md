# Fixral CMS — Yeniden Tasarım Ana Belgesi (Redesign Master)

> **Amaç:** Arayüzün tamamen değiştirileceği (Claude Design ile yeniden tasarım) bir çalışma öncesinde,
> projenin **mimarisini, veri akışını, mevcut tasarım sistemini, bileşen envanterini ve kırılma risklerini**
> tek belgede toplamak.
>
> **Bu belge ne DEĞİLDİR:** Yeni tasarımın kendisi. Yeni tasarım kararları
> `## 18. Kısıtlar ve Tasarım Kararları

> **Durum (30 Ekim 2026):** Yeniden tasarım public siteye uygulandı (redesign 2026, "FIXRAL web").
> Onaylı prototip: https://claude.ai/artifact/2nz9WzVN2hf6AHreNvuhcS · Marka sistemi:
> https://claude.ai/artifact/N2GmUpy3UHWUinCFKAAeLd

### 18.1 Kapsam

**A — yalnız public site.** Admin paneline dokunulmadı (font/radius/token'lar `.public-theme`
kapsamında; admin Barlow + 12px radius ile aynı kaldı). Ortak dosyalarda admin'i etkileyen tek
değişiklikler: marka turuncusu ölçeği (`--brand-primary-*` → #F97316 ailesi) ve root `LoadingBar`.

### 18.2 Görsel yön

- Marka sistemi: ink #101828, Fixral Turuncu #F97316 (sayfada tek iş: birincil buton / ikon / vurgu),
  turuncu üstüne koyu metin. Space Grotesk (başlık) · Inter (gövde) · JetBrains Mono (teknik).
  Radius 4 / 8 / 16. Gölge tek seviye.
- **Varsayılan tema koyu**; açık tema anahtarı korunur (`fixral-public-theme` = `light` ise açık).
- "Teknik resim paftası" dili: bölüm başlıkları çizim çağrısı (eyebrow + çizgi), hero altında
  antet (Pafta · Tolerans ±0,05 mm · Tarama 20 µm · Çıktı STL/STEP/OBJ · Rev).
- Header, hero, süreç, teklif bandı, sayfa başlıkları ve footer her temada koyu ada
  (`public-theme public-dark`). Header artık `sticky` (64px), `fixed` değil.
- 3D (three.js r160, `src/components/fx/three/`): HeroMark (logo geometrisinden ekstrüde FX işareti),
  PartScene (nokta bulutu → tel kafes → sapma haritası → katman katman baskı; süreç bölümü
  kaydırmaya bağlı), SplitScene (Fixral 3D Splitter), 2D canvas: Router Studio takım yolu,
  ESP32-S3 OBD-II göstergesi. Hepsi dinamik import ile ayrı chunk; görünmezken durur;
  reduced-motion'da intro/otomatik dönüş yok; WebGL yoksa SVG işaret.

### 18.3 Korunacaklar (dokunulmadı)

Veri katmanı (Prisma adapter, API route'ları), tema init script'leri (yalnız varsayılan koyuya
çevrildi), `@custom-variant dark`, `public-theme public-dark` çift sınıf kuralı, nav'ın
PageSettingRow'dan gelmesi, `haberler`/`noticias` eşlemesi, `revalidate`, JSON-LD bileşenleri,
`m.*` (LazyMotion) kullanımı, reduced-motion çökmesi (testler yeşil).

### 18.4 Kaldırılanlar

Eski anasayfa bölümleri (`src/components/home/*`: NewHero, HeroContent, HeroModelViewer,
ClientLogos, ServicesBentoGrid, ProcessFlow, PortfolioHorizontalShowcase, StatsCounter,
NewsEditorialGrid, FullWidthCTA), `MobileNavLink`, `ServicesPageClient`, `[lang]/services/ServicesClient`,
`ModernProjectCard/Grid`, `HomePortfolioSection`, `PortfolioDetailHero`, `GrainOverlay`.
13 hizmetlik eski liste yerine marka kitabındaki 8 hizmet (web / yapay zeka / markalaşma çıktı).

### 18.5 Yeni yüzeyler

- `/[lang]/services/[slug]` — 8 hizmet detayı (eski slug'lar `next.config.js` redirects ile kalıcı yönlenir).
- `/[lang]/software` ve `/[lang]/software/[slug]` — Fixral 3D Splitter, Router Studio 2.0.0,
  ESP32-S3 OBD-II (bilgiler GitHub README'lerinden).
- Anasayfa: hizmet şeridi, disiplin dizini, kaydırmalı 3D süreç, yazılımlar, teslimat (örnek
  G-kodu / BOM / ölçüm raporu), haber + video şeridi, kısa teklif formu.
- İletişim: 4 adımlı teklif formu (`src/lib/fx-quote.ts` → `/api/public/contact`); teklif modalı aynı yolu kullanır.
- Ctrl+K arama: hizmet ve yazılım katalogu + proje/haber.

### 18.6 Kabul kriterleri / yapılacaklar

- `npm run type-check`, `npm run lint` (0 hata), `npm test` yeşil.
- Canlıya almadan önce: `npm run content:redesign` (dry run) → `npm run content:redesign -- --apply`
  (Yazılımlar sayfa kaydı, menü sırası, 8 hizmet kaydı). İsteğe bağlı `--deactivate-old-services`,
  `--hide-demo` (seed'deki örnek web projeleri ve haberler).
- Gerçek proje, haber, iletişim bilgisi ve "Rakamlarla" değerleri yönetim panelinden girilmeli.
- İçerik yapısı: `src/content/fixral.ts`; arayüz metinleri: `messages/*.json` → `fx.*`;
  tasarım katmanı: `src/styles/fx-web.css` (+ `fx-services/portfolio/news/contact.css`).

### 18.7 Panel ↔ site bağlantısı (canlı içerik)

Şema değişikliği yok; panel verisi mevcut tablolarda tutulur, site her istekte birleşik veriyi okur.

| Site içeriği | Panelde | Saklandığı yer |
|---|---|---|
| Hero metni, CTA'lar, antet hücreleri, "slider kayıtlarını göster" | Site İçeriği → Anasayfa hero | `ContentSettingRow` key `fx-site` |
| Anasayfa bölüm başlıkları, bölümleri göster/gizle, disiplin adları/açıklamaları | Site İçeriği → Bölümler | `fx-site.sections` / `visibility` / `disciplines` |
| Süreç adımları (Tara → Modelle → Doğrula → Üret) | Site İçeriği → Süreç | `fx-site.process` |
| Teslimat satırları, örnek dosyalar (G-kodu / BOM / ölçüm raporu) | Site İçeriği → Teslimat | `fx-site.deliverables` / `docs` |
| Sayfa başlıkları (Hizmetler, Yazılımlar, Projeler, Haberler, Videolar, İletişim) | Site İçeriği → Sayfa başlıkları | `fx-site.pages` |
| Hizmetler (ad, kısa açıklama, giriş, ne zaman, iş akışı, sınırlar, disiplin, ikon, dosyalar, 3D görünüm, yazılımlar, görsel, uzun metin) | Hizmetler → kayıt → "Web sitesi" | `ServiceRow` + `translations._fx` / `translations.<dil>` |
| Yazılımlar (ad, sürüm, bağlantılar, görünüm, metinler, ilgili hizmetler, aktiflik, sıra) | Yazılımlar | `ContentSettingRow` key `fx-software` |
| Hero dönen metinleri (yalnız TR) | Slider | `SliderRow` (aktif) |
| Projeler, haberler, videolar, iletişim, footer, menü | Mevcut modüller | Değişmedi |

- Okuma: `src/lib/fx-data-server.ts` → `getFxData()` (React cache + `unstable_cache`, etiket `fx-content`,
  60 sn). Root layout veriyi `FxDataProvider` ile istemciye verir; bileşenler `useFx(lang)` kullanır.
  Sunucu sayfaları (metadata, JSON-LD, sitemap, hizmet/yazılım detayları) aynı `getFxData()`'yı çağırır.
- Yazma: admin route'ları `withFxRevalidate` ile sarılı; panelde kaydedilen her değişiklik
  `revalidateTag('fx-content')` + `revalidatePath('/', 'layout')` ile siteyi anında tazeler.
- Birleştirme (`src/content/fx-data.ts`): panelde boş bırakılan alan varsayılana düşer; DB yoksa
  katalog (`src/content/fixral.ts`) + `fx.*` çevirileri kullanılır. Hizmetlerde: "Sitede göster"
  açık kayıtlar listelenir; standart 8 hizmetten panelde web kaydı olmayanlar katalogdan gelir;
  aynı slug'lı kayıt pasifse ya da "Sitede göster" kapalıysa katalog hizmeti de gizlenir; web
  alanı olmayan eski kayıtlar eşleşen kataloğa görsel + uzun metin verir. Kurallar
  `src/lib/__tests__/fx-data.test.ts` ile sabitlendi.
- Panelden eklenen yeni hizmet/yazılım derleme gerektirmeden yayınlanır (`dynamicParams = true`) ve
  sitemap'e girer.
- `npm run content:redesign -- --apply` artık 8 hizmeti tüm web alanlarıyla panele yazar (panelde
  zaten düzenlenmiş kayıtlara dokunmaz; `--force-services` ile yenilenir).

---

## Ek A — Dosya → Sorumluluk İndeksi

### Yapılandırma

| Dosya | Sorumluluk |
|---|---|
| `src/app/globals.css` | **Tüm tasarım token'ları, 60+ utility, 4 tema scope'u** |
| `src/styles/editor.css` | TipTap editör stilleri (`public-prose` ile eşleşmeli) |
| `next.config.js` | webpack alias, image patterns, `optimizePackageImports`, glb/gltf loader |
| `components.json` | shadcn CLI ayarı (new-york, slate, cssVariables) |
| `site.config.js` | **Legacy renk paleti (#003450 lacivert) — artık kullanılmıyor, globals.css kazanır** |
| `vercel.json` | Güvenlik başlıkları, cron, rewrite (`/sitemap.xml`, `/robots.txt`) |
| `tsconfig.json` · `eslint.config.mjs` · `jest.config.js` · `postcss.config.js` | — |
| `prisma/schema.prisma` | 20 tablo |

### Uygulama kabuğu

| Dosya | Sorumluluk |
|---|---|
| `src/proxy.ts` | Middleware: locale, rate limit, güvenlik, sayfa erişimi |
| `src/app/layout.tsx` | Kök layout, tema init script'leri, fontlar, metadata, sağlayıcılar |
| `src/app/[lang]/layout.tsx` | NextIntl provider |
| `src/app/admin/layout.tsx` | Admin shell + oturum bekçisi |
| `src/i18n.ts` · `src/i18n/request.ts` | locale listesi, mesaj yükleyici |
| `messages/tr.json` · `messages/es.json` | 216 anahtar |

### Tema

| Dosya | Sorumluluk |
|---|---|
| `src/lib/public-theme.ts` | Public tema oku/yaz/uygula/temizle + event |
| `src/components/providers/ThemeScope.tsx` | Public tema class bekçisi |
| `src/components/providers/AdminThemeProvider.tsx` | Admin tema (light/dark/system) |
| `src/components/ui/ThemeToggle.tsx` · `admin/ThemeToggle.tsx` | Anahtarlar |

### Veri

| Dosya | Sorumluluk |
|---|---|
| `src/lib/prisma.ts` · `prisma-model-adapter.ts` | Prisma client + Mongoose uyumlu kabuk |
| `src/models/*.ts` (18) | Tek satırlık model sarmalayıcıları |
| `src/models/_factory.ts` | Varsayılan ayar nesneleri |
| `src/lib/data.ts` | `getPortfolioItems()` vb. |
| `src/lib/site-settings.ts` | `getCachedSiteSettings()` |
| `src/lib/cache.ts` · `news-cache-service.ts` | Önbellek |

### SEO

| Dosya | Sorumluluk |
|---|---|
| `src/lib/seo-utils.ts` | `SITE_URL`, `generateAlternates`, `generateOgImages` |
| `src/lib/seo-service.ts` · `sitemap-service.ts` · `schema-markup.tsx` | — |
| `src/components/seo/*` (6) | JSON-LD bileşenleri |
| `src/app/sitemap.ts` · `robots.ts` | — |

### Yardımcılar

| Dosya | Sorumluluk |
|---|---|
| `src/lib/utils.ts` | `cn()` (clsx + tailwind-merge) |
| `src/lib/icons.ts` | `resolveIcon()`, `getIconForPage()`, `resolveIconForService()` |
| `src/core/lib/config.ts` (315) | Ortam yapılandırması |
| `src/core/lib/logger.ts` (144) | Loglama |
| `src/hooks/*` (11) | `useLocale`, `useAppTranslations`, `usePortfolioFilters`, `use-motion`, `use-confirm`, `use-mobile`, `useApi`, `useAuth`, `usePWA`, `useActiveLanguages`, `use-sidebar-counts` |

---

*Bu belge kod taramasından üretilmiştir. Kod değiştikçe §7 (token), §10 (bileşen envanteri) ve
§15 (ölü kod) bölümleri yeniden doğrulanmalıdır.*
