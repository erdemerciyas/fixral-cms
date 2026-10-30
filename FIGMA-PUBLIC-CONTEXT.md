# Fixral — Public Site Yapısal Context (Figma Tasarım Briefi)

> **Amaç:** Bu doküman, Fixral public (ziyaretçiye açık) sitesinin **yapısal / mantıksal** dökümüdür.
> Figma'da sıfırdan tasarım yapılırken hangi sayfaların, bölümlerin, içerik alanlarının ve
> durumların (state) tasarlanması gerektiğini eksiksiz tanımlar.
>
> **Kapsam dışı:** `/admin/**` yönetim paneli ve `/api/admin/**` uçları. Bu dokümanda yer almaz.
>
> **Kapsam dışı (bilinçli):** Renk paleti, tipografi ölçeği, gölge/radius gibi görsel karar
> katmanı. Mevcut görsel dil bağlayıcı değildir — sıfırdan kurulacaktır. Ancak
> **layout metrikleri** (grid kolonları, aspect ratio, container genişliği) yapısal olduğu için
> dahil edildi; değiştirilmesi kod değişikliği gerektirir ve bölüm 12'de işaretlendi.

---

## 1. Proje Kimliği ve Teknik Zemin

| Konu | Değer |
|---|---|
| Uygulama adı | `fixral-cms` v5.1.3 |
| Framework | Next.js 16 (App Router), React 19 |
| Dil / tip | TypeScript |
| Stil altyapısı | Tailwind CSS v4 (tek kaynak: `src/app/globals.css`, `@theme` blokları) |
| UI primitive | Radix UI + shadcn deseni |
| Animasyon | framer-motion (`LazyMotion` + `m`), GSAP kullanılmıyor |
| 3D | `@react-three/fiber` + `drei` + `three-stdlib` (GLTF/GLB/STL/OBJ) |
| Carousel | Kendi yazılmış hero carousel; Swiper kurulu ama public sayfalarda **kullanılmıyor** |
| Veritabanı | PostgreSQL + Prisma 5 |
| Kimlik doğrulama | NextAuth (credentials) + JWT |
| i18n | `next-intl`, `messages/tr.json` + `messages/es.json` |
| Medya | Cloudinary (görsel + 3D dosya) |
| Edge katmanı | `src/proxy.ts` (Next 16'da `middleware.ts` yerine) |

**İş alanı:** Endüstriyel mühendislik hizmetleri — 3D tarama, tersine mühendislik, CAD modelleme,
3D baskı (FDM/SLA/SLS), prototipleme, restorasyon, yazılım/AI çözümleri. Anlatı dili
"precision engineering": ölçüm, tolerans, doğrulanabilirlik.

---

## 2. Bilgi Mimarisi ve Route Haritası

### 2.1 Dil yapısı

- Aktif diller: **`tr`** (varsayılan) ve **`es`**. Dil listesi DB'den de okunabilir (`LanguageRow`),
  fakat route mantığı kodda `['tr','es']` olarak sabit.
- Her public URL `/{lang}/...` ile başlar. `/` → `/tr` yönlendirmesi yapılır.
- Locale önekisiz gelen istekler proxy'de otomatik olarak locale'e yönlendirilir.

### 2.2 Lokalize segment kuralı (kritik)

Haber bölümünün URL segmenti dile göre **değişir**:

| Locale | Kanonik segment | Yanlış URL davranışı |
|---|---|---|
| `tr` | `haberler` | `/tr/noticias` → 301 → `/tr/haberler` |
| `es` | `noticias` | `/es/haberler` → 301 → `/es/noticias` |

Dosya sisteminde **iki paralel route ağacı** var (`[lang]/haberler/*` ve `[lang]/noticias/*`);
içerik aynı DB kaydından, sadece `translations.tr` / `translations.es` alanı farklı okunuyor.
Diğer tüm segmentler (`portfolio`, `services`, `contact`, `videos`, `account`, `login`, `register`)
her iki dilde de İngilizce/ortak kalır.

### 2.3 Tasarlanacak public sayfa listesi (14 route × 2 dil)

| # | URL deseni | Sayfa | Render | Tasarım önceliği |
|---|---|---|---|---|
| 1 | `/{lang}` | Anasayfa | Server kabuk + client bölümler | **Yüksek** |
| 2 | `/{lang}/services` | Hizmetler | Server hero + client liste | **Yüksek** |
| 3 | `/{lang}/portfolio` | Portfolyo listesi | Server veri + client şablon | **Yüksek** |
| 4 | `/{lang}/portfolio/{slug}` | Proje detayı | Server veri + client görünüm | **Yüksek** |
| 5 | `/{lang}/haberler` \| `/{lang}/noticias` | Haber listesi | Server veri + client görünüm | **Yüksek** |
| 6 | `/{lang}/haberler/{slug}` \| `/{lang}/noticias/{slug}` | Haber detayı | Server veri + client görünüm | **Yüksek** |
| 7 | `/{lang}/contact` | İletişim | Client | **Yüksek** |
| 8 | `/{lang}/videos` | Video galeri | Server hero + client liste | Orta |
| 9 | `/{lang}/account` | Kullanıcı hesabı | Client (oturum korumalı) | Orta |
| 10 | `/{lang}/login` | Giriş | Client | Düşük |
| 11 | `/{lang}/register` | Kayıt | Client | Düşük |
| 12 | `/{lang}/offline` | Çevrimdışı (PWA) | Client | Düşük |
| 13 | `not-found` (global 404) | 404 | Client | Orta |
| 14 | `error` / `global-error` | Hata ekranı | Client | Orta |

**Ek olarak tasarlanması gereken, sayfa olmayan yüzeyler:**
- Global Header (masaüstü + mobil)
- Global Footer
- Mobil menü (tam ekran overlay)
- Arama modalı (Cmd/Ctrl+K)
- "Teklif Al" proje başvuru modalı
- Dil değiştirici dropdown
- Hesap dropdown (masaüstü nav)
- Portfolyo medya lightbox'ı (tam ekran)
- Breadcrumb bileşeni
- Route loading skeleton'ları (global + portfolyo)
- Back-to-top yüzen buton
- Toast bildirimleri (sonner)
- Okuma progress bar (haber detay)

### 2.4 Kodda linki olan ama sayfası olmayan route'lar (karar gerekiyor)

| Link kaynağı | Hedef | Durum |
|---|---|---|
| 404 sayfası | `/{lang}/about` | Sayfa **yok** — tasarlanacak mı? |
| Login sayfası | `/{lang}/forgot-password` | Sayfa **yok** — tasarlanacak mı? |

### 2.5 SEO / indeksleme

- `robots.txt`: `/admin/`, `/api/`, `/{lang}/account/`, `/{lang}/login/`, `/{lang}/register/` **disallow**.
- Dinamik `sitemap.xml`: statik sayfalar + yayınlanmış haber slug'ları + aktif portfolyo slug'ları, her iki dil için.
- Her sayfa `generateMetadata` ile title/description/OG/hreflang üretir (`tr-TR`, `es-ES`, `x-default`).
- JSON-LD: Breadcrumb, NewsArticle, Portfolio (CreativeWork), Services listesi.
- `opengraph-image` route'u **yok** → statik `public/og-image.jpg` kullanılıyor. Yeni OG şablonu tasarlanabilir.

---

## 3. Global Kabuk (Tüm Public Sayfalarda)

Kök layout her public sayfayı aşağıdaki katmanlarla sarar. Sıra render sırasıdır:

| Katman | Rol | Tasarım gereksinimi |
|---|---|---|
| Loading bar | Route değişiminde üstte ilerleme çubuğu | İnce (2–3px) üst şerit |
| Header | Sabit (fixed) üst çubuk, yükseklik **56px**, z-index 200 | Masaüstü + mobil varyant |
| Page transition wrapper | Sayfa geçişinde fade | — |
| `<main>` | Sayfa içeriği | — |
| Footer | Sayfa altı, 4 kolon | Tek varyant |
| Grain overlay | Tam ekran doku katmanı (dekoratif) | Opsiyonel; kaldırılabilir |
| Toaster | Sağ üst/alt bildirim yığını | Success / error / info |

### 3.1 Header yapısı

Soldan sağa bloklar:

1. **Logo bloğu** — logo görseli (kare, CMS'ten `logo.url`) + `logoText` (CMS'ten). İkisi de opsiyonel; yoksa hiç render edilmez. Link: `/{lang}`.
2. **Arama tetikleyici** (yalnız `lg+`) — ikon + placeholder metni + `Ctrl K` kbd etiketi. Hover/focus'ta genişler (192px → 256px).
3. **Ana navigasyon** (yalnız `lg+`) — link listesi **CMS'ten dinamik** gelir (`PageSettingRow`: `title`, `path`, `icon`, `order`, `showInNavigation`, `isActive`). Masaüstünde her link başında sıfır dolgulu index (`01`, `02`…) gösterilir. Aktif link alt kenarlıkla işaretlenir.
   - **Fallback nav** (API başarısızsa): Anasayfa, Haberler, Hizmetler, Portföy, Videolar, İletişim.
   - **Tasarım notu:** link sayısı sabit değil (2–8 arası varsayın), etiket uzunluğu değişken.
4. **Dil değiştirici** (yalnız `lg+`) — 1'den fazla aktif dil varsa görünür, aksi halde hiç render edilmez.
5. **Tema toggle** — açık/koyu.
6. **Mobil arama ikonu** (yalnız `<lg`).
7. **Birincil CTA "Teklif Al"** (yalnız `lg+`) — modal açar, magnetic hover davranışı.
8. **Hamburger** (yalnız `<lg`) — mobil menüyü açar; ikon menu↔close arasında dönerek geçiş yapar.

**Header davranış durumları:**

| Durum | Koşul |
|---|---|
| Anasayfa tepesi | Saydam, kenarlıksız, hero'nun koyu scope'unu miras alır |
| Scroll sonrası (>8px) | Opak zemin + alt hairline kenarlık |
| Alt sayfalar | Her zaman opak |

**Klavye:** `Ctrl/Cmd+K` arama aç/kapa, `Esc` arama ve mobil menüyü kapatır.
**Erişilebilirlik:** Header'dan önce "Ana içeriğe atla" skip-link (focus'ta görünür) tasarlanmalı.

### 3.2 Mobil menü (tam ekran overlay)

1. Başlık satırı: `logoText` (veya "Menü") + kapat butonu
2. Arama formu — submit'te haber listesine `?q=` ile gider (header aramasından farklı davranış)
3. Nav linkleri — sırayla animasyonlu giriş, aktif durum işaretli
4. Alt aksiyon bloğu:
   - Oturum açıksa: kullanıcı kartı (avatar baş harfi, ad, e-posta) + "Hesabım"
   - Oturum kapalıysa: "Giriş Yap"
   - "Proje Başvurusu" butonu → teklif modalını açar

### 3.3 Arama modalı

- Girdi: tek arama alanı + `ESC` ipucu + kapat butonu
- Debounce 350ms; iki uca paralel istek: haberler ve portfolyo (her birinden **3 sonuç**)
- Sonuçlar kategoriye göre gruplanır: `Haberler`, `Portföy`, `Hizmetler` *(Hizmetler kategorisi tanımlı ama sorgulanmıyor — tasarımda 3 grup öngörün, ileride açılabilir)*
- Sonuç satırı: başlık + opsiyonel kısaltılmış açıklama + ok ikonu
- Alt satır: `Tüm sonuçları gör: "{sorgu}"`
- **Durumlar:** boş sorgu (hızlı linkler: Haberler / Portföy / Hizmetler) · yükleniyor · sonuç listesi · sonuç yok

### 3.4 "Teklif Al" proje başvuru modalı

Tek adımlı form. Alanlar:

| Alan | Tip | Zorunlu | Seçenekler |
|---|---|---|---|
| Ad Soyad | text | ✓ | — |
| E-posta | email | ✓ | — |
| Telefon | tel | — | — |
| Proje Türü | select | ✓ | 3D Tarama, Tersine Mühendislik, 3D Modelleme, CAD Tasarım, Prototip, Danışmanlık, Diğer |
| Bütçe Aralığı | select | — | <5k, 5k–15k, 15k–50k, 50k+, Görüşelim |
| Zaman Planı | select | — | En kısa sürede, 1 hafta, 1 ay, 3 ay, Esnek |
| Proje Detayları | textarea (4 satır) | ✓ | — |

**Durumlar:** boşta · gönderiliyor (buton devre dışı) · başarılı (yeşil banner + toast, 2s sonra otomatik kapanma) · hata (kırmızı banner + toast).
**Aksiyonlar:** İptal · Başvuruyu Gönder.

### 3.5 Footer yapısı

Ana grid: `1 kolon (mobil) → 2 (md) → 4 (lg)`, gap 32px. İçerik tamamen CMS'ten (`FooterSettingsRow`).

| Kolon | İçerik | Görünürlük anahtarı |
|---|---|---|
| 1 | Logo + site adı + `mainDescription` metni + sosyal ikon satırı | `showSocialLinks` |
| 2 | Hızlı bağlantılar (listenin **ilk yarısı**) | `showQuickLinks` |
| 3 | Hızlı bağlantılar (listenin **ikinci yarısı**), başlığı "Hizmetler" | `showQuickLinks` |
| 4 | İletişim: e-posta (mailto), telefon (tel), adres | `showContactInfo` |

Alt bant: `© {yıl} {şirket}. {ek metin}` + sürüm etiketi + "Geliştiren {isim}" (link).
Sosyal platformlar: LinkedIn, Twitter, Instagram, Facebook, GitHub, YouTube — **yalnız URL'si dolu olanlar** render edilir (0–6 ikon).

**Back-to-top:** scroll >300px olduğunda sağ altta sabit 44×44 buton.

---

## 4. Layout Sistemi ve Kırılım Noktaları

### 4.1 Breakpoint'ler (Tailwind v4 varsayılanları)

| Ad | Genişlik | Kullanım yoğunluğu |
|---|---|---|
| `sm` | 640px | Orta |
| `md` | 768px | **Yoğun** — grid dönüşümlerinin ana eşiği |
| `lg` | 1024px | **Yoğun** — nav/sidebar dönüşümlerinin eşiği |
| `xl` | 1280px | Az |
| `2xl` | 1536px | Çok az |

**Tasarlanması önerilen frame genişlikleri:** 390 (mobil), 768 (tablet), 1440 (masaüstü). Opsiyonel: 1920.

### 4.2 Container

Tüm `container-*` yardımcıları **aynı** ölçüye hizalı:

```
max-width: 1280px (max-w-7xl)
padding-x: 16px → 24px (sm) → 32px (lg)
margin: auto
```

**İstisna:** Haber detay sayfası `maxWidth: 1400px` + `padding-x: 24/32/64px` kullanır (kodda gömülü inline stil). Bu bir **tutarsızlık** — bkz. bölüm 12.

`container-narrow` (max 768px) tanımlı ama public sayfalarda kullanılmıyor.

### 4.3 Dikey ritim

| Bağlam | Değer |
|---|---|
| Header offset (sabit) | 56px — hero kendi içinde `pt-14` ile telafi eder |
| Anasayfa ana bölüm padding | `py-80px` → `py-112px` (md) |
| Stats bandı | `py-64px` → `py-80px` (md) |
| PageHero (default) | min-height `40dvh`, `pt-112 pb-56` → `pt-128 pb-64` (md) |
| PageHero (compact) | min-height `30dvh`, `pt-96 pb-40` → `pt-112 pb-48` (md) |
| Bölüm başlığı alt boşluğu | 64px → 80px (md) |
| Bölüm ayırıcı | 1px hairline (bölümlerin üst kenarında) |

### 4.4 Z-index katmanları

| Katman | z |
|---|---|
| Skip link (focus) | 9999 |
| Header | 200 |
| Mobil menü / modallar | Radix portal (header üstü) |
| Okuma progress bar | 50 |
| Back-to-top | 40 |
| Hero carousel kontrolleri | 20 |
| Hero içerik | 10 |

---

## 5. Sayfa Sayfa Yapısal Döküm

### 5.1 Anasayfa — `/{lang}`

Hero `<main>` dışında (full-bleed), diğer 7 bölüm `<main>` içinde. Sıra:

---

#### Bölüm 1 — Hero (full-bleed, koyu scope, carousel)

**Veri:** `GET /api/public/slider` → aktif slider kayıtları, `order` ile sıralı.
**Veri yoksa:** i18n varsayılanlarıyla tek slide render edilir (asla boş kalmaz).

Layout: `min-height 560px` (mobil) / `640px` (lg+). Grid: `1fr` + `420px` (yalnız lg+), gap 64px.

**Sol kolon (metin katmanı) içerik slotları:**

| Slot | Kaynak | Fallback | Not |
|---|---|---|---|
| Eyebrow etiketi | `slide.badge` → `slide.subtitle` | `home.hero.defaultBadge` | Monospace teknik etiket, crosshair marker |
| H1 başlık | `slide.title` | `home.hero.defaultTitle` | Tek satırdan 3 satıra kadar esneyebilir |
| Açıklama | `slide.description` | `home.hero.defaultDescription` | max 58 karakter genişliği (`58ch`) |
| Spec bandı | **Sabit** i18n | `TOLERANS ±0.05 MM` · `TARAMA 20 µM` · `STL / STEP / OBJ` | 3 öğe, üst-alt hairline arasında, dikey ayraçlı |
| Birincil CTA | `slide.buttonText` / `buttonLink` | `home.hero.defaultCta` → `/{lang}/portfolio` | Ok ikonlu |
| İkincil CTA | **Sabit** | `home.hero.secondaryCta` → `/{lang}/contact` | Outline |

**Sağ kolon (yalnız lg+):** 3D model önizleme paneli, `aspect-square`.
- Veri: `GET /api/public/3dmodels?limit=1`
- Durumlar: yükleniyor (spinner) · canlı 3D viewer (sürükleyerek döndürme) · statik poster (model yok veya reduced-motion)
- Alt bant: `CANLI 3D ÖNİZLEME` / `STATİK ÖNİZLEME` etiketi + `Döndürmek için sürükleyin` ipucu
- Köşelerde `+` crosshair işaretleri (dekoratif)

**Arka plan katmanları (alttan üste):** slide görseli (`object-cover`, tümü yığılı, aktif olan fade ile öne gelir) → soldan sağa koyu scrim gradyanı → blueprint grid → içerik.

**Carousel kontrolleri (yalnız 2+ slide varsa ve client mount sonrası):**
- Sol/sağ ok butonları: 40×40, dikeyde ortalı, kenardan 12/20px
- Dot göstergesi: altta ortalı, aktif olan genişlemiş çubuk (8px → 32px), yükseklik 6px
- Ekran okuyucu için `n / total` sayacı

**Davranışlar:** autoplay slide başına `duration` (varsayılan 5000ms) · fare hover'da duraklar (dokunmatikte duraklamaz) · etkileşim sonrası 4000ms duraklar · sol/sağ ok tuşları · yatay swipe (eşik 60px) · **`prefers-reduced-motion` açıkken autoplay hiç çalışmaz.**

---

#### Bölüm 2 — Yetkinlik şeridi (marquee)

Kesintisiz kayan yatay şerit. 9 sabit etiket (i18n): 3D Tarama, Tersine Mühendislik, FDM, SLA, SLS, CMM, CAD Modelleme, Prototipleme, Kalite Kontrol. Etiketler arasında ayraç işareti. Hover'da durur. Dekoratif (`aria-hidden`).

---

#### Bölüm 3 — Hizmetler kart grid'i

**Veri:** `GET /api/public/services?limit=6`

**Bölüm başlığı:** eyebrow `01 / Hizmetler` (crosshair marker) + H2 "Sunduğumuz Çözümler". Maks genişlik 768px.

**Grid:** `2 kolon (mobil) → 3 (md) → 4 (lg)`, gap 16px.

**Kart yapısı (yukarıdan aşağı):**
1. Görsel bloğu, `aspect-square` — görsel yoksa blueprint zemin + ortada 64×64 ikon kutusu (ikon `service.icon`'dan veya başlıktan türetilir)
2. Üst hairline ayraçtan sonra metin bloğu (padding 16px):
   - Numaralı teknik etiket (`01 / Hizmetler`, `02 / Hizmetler`…)
   - Başlık (`service.title`) — 1–2 satır
   - Açıklama (`service.description`, HTML içerik, **80 karaktere kırpılır**, `line-clamp-2`)
   - **Hover'da açılan spec satırı**: `service.features` ilk 3 öğesi ` · ` ile birleşik, monospace, tek satır truncate. Reduced-motion'da her zaman açık.
   - Sağa hizalı meta: `Detay →`

**Link:** `/{lang}/services#{başlık-slug}`

**Durumlar:**
- Yükleniyor: başlık skeleton (2 çubuk) + 6 kart skeleton
- Boş: bölüm başlığı + boş durum kartı ("Henüz hizmet bulunmuyor" / "Proje talebi için iletişime geçebilirsiniz." / CTA "Proje talebi bırakın" → iletişim)
- Dolu: grid

---

#### Bölüm 4 — Süreç akışı (4 adım, statik)

**Veri:** Tamamen i18n, API yok. **Adım sayısı sabit 4.**

**Bölüm başlığı:** eyebrow `02 / Süreç` + H2 "Taramadan Üretime" + alt metin "Her proje dört doğrulanabilir adımda ilerler."

**Layout:** mobilde dikey akış, `md+` yatayda 4 eşit kolon.

**Adım kartı:** üst satırda numaralı etiket + adım ikonu · başlık · açıklama.

| # | Başlık | Açıklama | İkon |
|---|---|---|---|
| 1 | Tara | Parça geometrisi yüksek çözünürlüklü 3D tarama ile dijitalleştirilir. | ScanLine |
| 2 | Modelle | Tarama verisi üretime hazır parametrik CAD modele dönüştürülür. | Box |
| 3 | Doğrula | Model, ölçüm raporlarıyla orijinal parçaya karşı doğrulanır. | BadgeCheck |
| 4 | Üret | Doğrulanan model FDM, SLA veya SLS ile üretime alınır. | Factory |

**Bağlayıcı:** adımlar arası ölçü cetveli (masaüstünde 40px genişlik yatay, mobilde 32px yükseklik dikey). Son adımdan sonra yok.

---

#### Bölüm 5 — Portfolyo vitrini

**Veri:** `GET /api/public/portfolio?limit=8`

**Bölüm başlığı:** eyebrow `03 / Portfolyo` + H2 "Öne Çıkan Projeler".

**Grid:** `2 → 3 (md) → 4 (lg)`, gap 16px. Maksimum 8 kart.

**Kart yapısı:**
1. Kapak görseli `aspect-4/3` — yoksa blueprint zemin
   - Hover'da scan-line overlay (reduced-motion'da gizli)
   - `featured` ise sol üstte "Öne Çıkan" etiketi
2. Üst hairline sonrası metin bloğu:
   - Başlık, `line-clamp-2`
   - Monospace metadata tablosu (etiket solda, değer sağda, yalnız dolu olanlar):
     - `Yöntem` ← kategori adları (virgülle birleşik)
     - `Müşteri` ← `client`
     - `Yıl` ← `completionDate`'ten yıl

**Bölüm CTA'sı:** "Tüm Projeler" outline butonu → `/{lang}/portfolio`

**Durumlar:** yükleniyor (8 kart skeleton) · boş (boş durum + iletişim CTA) · dolu

---

#### Bölüm 6 — İstatistik bandı

**Veri:** **Tamamen kodda sabit.** CMS'ten gelmiyor.

Üstte "Rakamlarla" etiketli ölçü cetveli. Grid: `2 kolon → 4 (md)`, gap 24/40px → 48px (md).

| Değer | Ön/son ek | Etiket |
|---|---|---|
| Bulunulan yıl − 2018 (dinamik hesap) | `+` | Yıl Deneyim |
| 150 | `+` | Tamamlanan Proje |
| 0.05 | `±` … ` mm` (2 ondalık) | Üretim Toleransı |
| 20 | ` µm` | Tarama Çözünürlüğü |

**Davranış:** görünüm alanına ilk girişte sayı sıfırdan hedefe animasyonla artar (~1.4s). Reduced-motion'da anında hedef değer.

---

#### Bölüm 7 — Haber grid'i (editorial)

**Veri:** `GET /api/public/news?status=published&limit=3&sortBy=publishedAt&sortOrder=desc`

**Bölüm başlığı:** eyebrow `04 / Haberler` + H2 "Son Gelişmeler".

**Grid:** `1 → 2 (sm) → 3 (lg)`, gap 24px. **Tam 3 kart.**

**Kart yapısı:**
1. Görsel `aspect-video` (16:9) — yoksa blueprint zemin
2. Metin bloğu (padding 16/20px):
   - Başlık ← `translations[lang].title`, `line-clamp-2`
   - Özet ← `translations[lang].excerpt`, `line-clamp-2` (varsa)
   - Alt monospace meta satırı: sol tarafta tarih (locale'e göre biçimli, `tabular-nums`), sağ tarafta `tags[0]` (dikey ayraçlı)

**Bölüm CTA'sı:** "Tüm Haberler" outline → `/{lang}/haberler` veya `/{lang}/noticias`

**Durumlar:** yükleniyor (3 kart skeleton) · boş ("Henüz haber bulunmuyor") · dolu

---

#### Bölüm 8 — Tam genişlik CTA paneli

Koyu scope + blueprint grid zemin. İçerik i18n'den, tamamen sabit:
- Eyebrow: "Proje Talebi" (crosshair)
- H2: "Projenizi Hayata Geçirelim"
- Alt metin: "Uzman ekibimiz ve modern teknolojilerimizle fikirlerinizi gerçeğe dönüştürmeye hazırız."
- Tek CTA: "İletişime Geç" → `/{lang}/contact`

---

### 5.2 Hizmetler — `/{lang}/services`

Üç bölüm: PageHero (server) → hizmet gezgini (client) → CTA bandı.

**Bölüm 1 — PageHero**
Veri: `PageSettingRow` (`pageId: 'services'`). Props:
`title` (varsayılan "Sunduğumuz Hizmetler") · `description` · `badge: "Hizmetler"` · `index: 1` · `buttonText: "Hizmetleri İncele"` → `#services` · breadcrumb açık.

**Bölüm 2 — Hizmet gezgini**
Veri: `GET /api/public/services` (limit yok, tümü — seed'de **11 hizmet** var, gerçekte 10–15 arası bekleyin).

Bölüm girişi: eyebrow "Hizmetler" + H2 "Detaylı Hizmet Açıklamaları" + alt metin + ölçü cetveli. Maks genişlik 672px.

**Layout:** `1 kolon (mobil) → [280px | 1fr] (lg)`, gap 32/48px.

**Sol: yapışkan sidebar navigasyonu** (`lg:sticky top-112px`, max yükseklik `100dvh − 128px`, taşarsa scroll)
- `lg` altında: yatay kaydırılabilir pill satırı
- Her öğe: sıfır dolgulu numara (`01`) + hizmet başlığı
- Aktif öğe belirgin işaretli (`aria-current`)

**Sağ: detay paneli** — seçili hizmet için:
1. Numaralı teknik etiket (`01 / Hizmet Adı`)
2. H2 başlık
3. Görsel `aspect-video` — yoksa hizmet başlığının **ilk harfi** dev tipografi olarak placeholder
4. Açıklama (HTML etiketleri **temizlenerek** düz metin olarak basılır)
5. Özellik listesi — her satır check ikonu + metin, sırayla animasyonlu giriş (`features[]`, sayı değişken 0–10)
6. Meta şeridi (üst-alt hairline arası, monospace, yalnız dolu olanlar): süre (saat ikonu) · puan (yıldız + `n/5`) · fiyat
   - ⚠️ `duration`, `rating`, `price` alanları **Prisma şemasında yok** — şu an her zaman boş. Tasarımda opsiyonel öngörün.
7. CTA: "Teklif Al →" → `/{lang}/contact?service={başlık}`

**Davranış:** sidebar'dan seçim yapılınca `lg` altında detay paneline yumuşak scroll.

**Durumlar:** yükleniyor (sidebar 4 çubuk + detay skeleton) · hata (ikon + "Bir hata oluştu" + "Tekrar Dene") · boş (ikon + "Henüz hizmet bulunmuyor" + alt metin) · dolu

**Bölüm 3 — CTA bandı**
Eyebrow "Özel Proje" · H2 "Özel Bir Projeniz mi Var?" · alt metin · iki CTA: "Proje Teklifi Al" (→ iletişim) ve "Örnek Projelerimizi İnceleyin" (→ portfolyo). Ortalanmış. Dekoratif geometrik şekiller.

---

### 5.3 Portfolyo listesi — `/{lang}/portfolio`

**Veri (server):** en fazla 100 aktif proje + tüm kategoriler + `PageSettingRow` (`pageId: 'portfolio'`). Filtreleme/sıralama **client-side** yapılır; sunucu sayfalama yok.

**Bölüm 1 — PageHero:** `title` (varsayılan "Portfolyo") · `description` · `index: 2` · CTA "Projeleri İncele" → `#projects` · breadcrumb açık.

**Bölüm 2 — Projeler (`#projects`)**

Bölüm başlığı: eyebrow `01 / Projeler` + H2 "Çalışma Galerisi" + alt metin.

**Filtre sistemi (3 katman):**

*a) Kategori pill barı* — "Tümünü Göster" + her kategori için pill. Aktif olanda kayan (spring) gösterge. Bu barda **tek seçim**.

*b) Kontrol satırı* (mobil dikey, `md+` yatay):
- Arama girdisi (ikon solda, temizle butonu sağda — sadece değer varsa)
- Sıralama select: En Yeni · En Eski · A-Z · Z-A · Kategoriye Göre
- "Filtreler" toggle butonu — aktif filtre sayısı badge olarak gösterilir

*c) Genişletilebilir gelişmiş panel* (açılır/kapanır, üst hairline ile ayrılmış) — `1 → 3 kolon (md)`:
- **Kategoriler**: checkbox listesi (**çoklu seçim**), max yükseklik 192px scroll
- **Teknolojiler**: checkbox listesi (monospace etiketler), max 192px scroll — liste projelerden dinamik türetilir
- **Tarih Aralığı**: Başlangıç + Bitiş date input'ları

*d) Sonuç satırı* (üst hairline): `{n} proje bulundu` (monospace) + "Filtreleri Temizle" (yalnız aktif filtre varsa)

**Masonry grid:** `1 kolon (mobil) → 12 kolon (md)`, gap 16/20px. Kart genişlikleri 6'lık tekrar deseniyle atanır:

| Index % 6 | Kolon genişliği | Kart aspect |
|---|---|---|
| 0 | 8/12 | 16:9 |
| 1 | 4/12 | 4:5 |
| 2 | 4/12 | 4:5 |
| 3 | 8/12 | 16:9 |
| 4 | 6/12 | 4:3 |
| 5 | 6/12 | 4:3 |
| (toplam ≤2 ise) | 6/12 | 4:3 |

**Proje kartı içerik slotları:**
- Kapak görseli (3 durum: yükleniyor pulse · yüklendi · hata → kırık görsel ikonu)
- Sol üst badge'ler: "Öne Çıkan" (`featured`) ve "3D" (küp ikonu, `models3D` doluysa)
- **Hover overlay:** başlık + en fazla 3 teknoloji etiketi + `+N` taşma
- Görsel altı: başlık · açıklama (`line-clamp-2`) · monospace meta (`Müşteri` / `Tarih`)

**Durumlar:**
- Yükleniyor: 6 kartlık masonry skeleton
- Filtre sonucu boş (ama proje var): büyük arama ikonu + "Arama Sonucu Bulunamadı" + açıklama + "Filtreleri Temizle"
- Hiç proje yok: hiçbir şey render edilmez ⚠️ (bkz. bölüm 12)
- Sunucu hatası: tam ekran hata bloğu + "Tekrar Dene"

**Bölüm 3 — CTA bandı:** Vurgu zeminli, ortalanmış. Eyebrow "Birlikte Çalışalım" · H2 "Projenizi Birlikte Gerçekleştirelim" · alt metin · iki CTA ("Proje Başlatalım" → iletişim, "Hizmetlerimizi İnceleyin" → hizmetler).

---

### 5.4 Proje detayı — `/{lang}/portfolio/{slug}`

**Veri (server):** slug ile aktif proje + aynı kategoriden ilişkili projeler. `generateStaticParams` ile her iki dilde ön üretim, ISR 3600s.

**Bölüm 1 — PageHero (compact varyant):** `title` = proje adı · buton yok · breadcrumb açık · `featuredBadge: "Öne Çıkan Proje"` (yalnız `featured` ise) · `index: 2`.

**Bölüm 2 — İçerik grid'i:** `1 kolon → 12 kolon (lg)`, gap 32/48px.

#### Sol kolon (8/12)

**a) Medya galerisi**
Görseller + 3D modeller **tek akışta** birleştirilir (sekme yok). `coverImage` başa alınır.
1. Ana gösterim `aspect-16/10`:
   - Görsel: tam kaplama + hover'da büyüteç ikonu → lightbox açar
   - 3D: gömülü viewer + format badge + indirilebilirse indir ikonu
2. Thumbnail grid (yalnız 1'den fazla öğe varsa):
   - Başlık satırı: "Proje Medyaları" + toplam sayı badge'i + `{n} 3D` badge'i
   - Thumbnail'lar: `2 → 6 kolon`, kare, tip ikonu, index numarası, seçili olanda kenarlık

**Lightbox (tam ekran portal):** kapat (Esc) · önceki/sonraki (ok butonları + klavye) · sayaç `01 / NN` · görsel `object-contain` · 3D için maks 896px genişlik / 384px yükseklik + indir butonu · alt bant: başlık + tip + format + dosya boyutu (3D'de) · zemin tıklaması kapatır.

**3D viewer kontrolleri:** orbit (döndür), pan, zoom. Auto-rotate yok.

**b) Proje Detayları**
Başlık "Proje Detayları" + ölçü cetveli, ardından kart içinde zengin metin (`prose`). `description` HTML içeriktir — başlık, paragraf, liste, link, kalın, görsel içerebilir. Tasarımda **tipografi hiyerarşisi tanımlanmalı.**

**c) 3D Modeller** (yalnız `models3D` doluysa)
Başlık "3D Modeller" + ölçü cetveli + dosya listesi. Her satır: format badge (STL/OBJ/GLTF/GLB) + dosya adı.

#### Sağ kolon (4/12, `lg:sticky top-96px`)

**a) Proje Bilgileri kartı** — monospace spec tablosu, satırlar hairline ile ayrılmış. Etiket solda, değer sağda. Yalnız dolu alanlar:

| Etiket | Kaynak |
|---|---|
| Müşteri | `client` |
| Tarih | `completionDate` (uzun ay formatı) |
| Kategori | kategori adları veya "Genel" |
| Durum | **her zaman** "Tamamlandı" (check ikonu, başarı rengi) |
| Kullanılan Teknolojiler | `technologies[]` → etiket bulutu (satır kaplar, alt alta) |

**b) CTA kartı** — "Benzer Bir Projeniz mi Var?" + açıklama + tam genişlik "Teklif Alın" butonu → iletişim.

**Bölüm 3 — Benzer Projeler** (yalnız ilişkili proje varsa)
Üst hairline ayraç. Bölüm başlığı + alt metin. Standart grid layout'ta proje kartları. Altta ortalanmış "Tüm Portföyü Görüntüle" outline butonu.

---

### 5.5 Haber listesi — `/{lang}/haberler` · `/{lang}/noticias`

**Veri (server):** yayınlanmış haberler, `publishedAt` azalan, **sayfa başına 12 kayıt**. Etiket listesi tüm yayınlanmış haberlerden `distinct` çekilir.

**Query parametreleri:** `page` (varsayılan 1) · `search` · `tag`

**Bölüm 1 — PageHero:** `title` = "Haberler & Duyurular" · `description` · buton **yok** · breadcrumb açık · `index: 3`.

**Bölüm 2 — Filtre çubuğu** (kart içinde, mobil dikey / `md+` yatay iki uca yayılmış)
- Sol: arama formu (genişlik `md+`'de 320px), placeholder "Haberlerde ara..."
- Sağ: etiket pill'leri — "Tümü" + her etiket. Aktif olan dolu, diğerleri nötr. Link tabanlı (`?tag=`).

**Bölüm 3 — Sonuç bilgisi** (yalnız `search` veya `tag` varsa)
Nokta işareti + `"{sorgu}" için` / `"{etiket}" etiketinde` + `{n} sonuç bulundu` (vurgulu).

**Bölüm 4 — Makale listesi**

**a) Öne çıkan hero kartı** — yalnızca `sayfa === 1 && arama yok && etiket yok` koşulunda.
- Görsel `aspect-21/9` (mobil) / `2.4:1` (md+), tam genişlik. Hover'da hafif zoom.
- Görsel üstüne çift gradyan overlay (alttan ve soldan)
- Sol altta içerik bloğu (padding 24/40/56px, maks 672px):
  - `tags[0]` teknik etiketi + tarih (monospace)
  - H2 başlık, `line-clamp-2`
  - Özet, `line-clamp-2`
  - "Devamını Oku →"

**b) Asimetrik kart grid'i** — `1 kolon → 12 kolon (md)`, gap 24/28px.
- `index % 3 === 0` → 7/12 genişlik, "large" varyant, görsel `aspect-4/3`
- Diğerleri → 5/12 genişlik, "default" varyant, görsel `aspect-16/10`

**Kart içeriği:** görsel (hover zoom + gradyan) · `tags[0]` etiketi + tarih satırı · başlık `line-clamp-2` · özet `line-clamp-3` · alt satırda "Devamını Oku →". Hover'da hafif yukarı kalkma.

**c) Sayfalama** (yalnız `totalPages > 1`) — ortalanmış. "Önceki" (varsa) + **tüm sayfa numaraları** (40×40 kare, monospace) + "Sonraki" (varsa). Aktif sayfa dolu. Link tabanlı, mevcut `search`/`tag` korunur.
> ⚠️ Sayfa numaraları kısaltılmıyor (ellipsis yok) — 20 sayfada 20 buton çıkar. Tasarımda ellipsis deseni önerilir.

**Durumlar:** dolu · sonuç yok (kesikli kenarlıklı blok: gazete ikonu + "Sonuç Bulunamadı" + açıklama + "Tüm Haberleri Göster" CTA)

**Hata durumu:** ayrı `error.tsx` — ikon + "Bir hata oluştu" + "Tekrar Dene".

---

### 5.6 Haber detayı — `/{lang}/haberler/{slug}` · `/{lang}/noticias/{slug}`

**Veri (server):** slug ile haber + `translations[locale]`. `force-dynamic`.

**Kalıcı öğe:** üstte sabit **okuma progress bar'ı** (3px, scroll ilerlemesine göre soldan sağa dolar, spring yumuşatmalı).

**Bölüm 1 — Hero** (görsel yok, düz zemin, alt hairline)
Padding: `pt-128/160px`, `pb-48/64px`. İçerik maks 768px, sırayla animasyonlu giriş:
1. Etiket satırı — **tüm** `tags[]` teknik etiket olarak (0–N adet)
2. H1 başlık — 3 satıra kadar esneyebilir
3. Özet (varsa) — maks 672px
4. Meta satırı: takvim ikonu + tarih (uzun format, monospace) · kullanıcı ikonu + yazar adı (varsa)

**Bölüm 2 — Breadcrumb** (kendi başına ince bant)

**Bölüm 3 — Makale gövdesi**
1. Öne çıkan görsel `aspect-video` (varsa), tam genişlik
2. Zengin metin gövdesi (`prose`) — tasarımda tanımlanması gereken elemanlar: h2/h3/h4, paragraf (satır yüksekliği 1.8), link, kalın, madde/sıralı liste, alıntı (sol kenarlıklı), inline kod, kod bloğu, tablo, gömülü görsel
3. **Etiket alt bloğu** (varsa) — üst hairline + etiket ikonu + "Konular" başlığı + `#etiket` pill'leri (haber listesine `?tag=` ile link)
4. **Paylaşım bloğu** — üst hairline + paylaş ikonu + "Bu Haberi Paylaş" + 3 kare ikon butonu (Twitter, Facebook, LinkedIn)
5. **Geri linki** — "← Tüm Haberlere Dön"

**Bölüm 4 — İlgili Projeler** (varsa)
Başlık + yanında uzayan hairline. Grid `1 → 2 (md)`, gap 20px. Kart: 208px yükseklikte görsel + üstüne gradyan + sol altta proje başlığı.

**Bölüm 5 — İlginizi Çekebilir** (ilgili haberler, varsa)
Başlık + hairline. **Yatay kaydırmalı** kart şeridi, snap davranışlı. Kart genişliği 280px (mobil) / 320px (md+). Kart: görsel `aspect-16/10` + başlık `line-clamp-2` + "Okumaya başla →".

**Not:** Bu sayfa 1400px container kullanır (diğerleri 1280px). Bölüm 12'ye bakın.

**ES lokali:** başlıklar sabit sözlükten (`Temas`, `Compartir esta noticia`, `Volver a todas las noticias`, `Proyectos Relacionados`, `Te puede interesar`, `Leer más`).

---

### 5.7 İletişim — `/{lang}/contact`

**Veri:** `GET /api/public/contact-info` (iletişim bilgileri) + sayfa ayarlarından hero metni. Form: `POST /api/public/contact`.

**Bölüm 1 — PageHero:** `title` (varsayılan "Bizimle İletişime Geçin") · `description` · CTA "İletişim Formu" → `#contact-form` · breadcrumb açık · `index: 5`.

**Bölüm 2 — Form + bilgi (`#contact-form`)**
Bölüm üstünde yukarıdan aşağı sönen blueprint bandı.
Bölüm girişi: eyebrow `01 / İletişim` + H2 "Size nasıl yardımcı olabiliriz?" + alt metin.

**Layout:** `1 kolon → 12 kolon (lg)`, gap 40/56px, üstten hizalı.

#### Sol (7/12) — Form kartı (padding 32/40px)

| Alan | Tip | Zorunlu | Placeholder | Layout |
|---|---|---|---|---|
| Adınız Soyadınız | text | ✓ | "Örn: Ali Veli" | `sm+`'de 2 kolonun solu |
| E-posta Adresiniz | email | ✓ | "iletisim@example.com" | `sm+`'de 2 kolonun sağı |
| Konu | text | ✓ | "Proje Teklifi" | Tam genişlik |
| Mesajınız | textarea (5 satır, resize kapalı) | ✓ | "Merhaba, ..." | Tam genişlik |

Girdi yüksekliği 48px. Submit butonu tam genişlik 48px: "Mesajı Gönder →".

**Form durumları:** boşta · gönderiliyor (spinner + "Gönderiliyor...", devre dışı) · başarılı (check ikonlu başarı banner'ı, form temizlenir) · hata (uyarı ikonlu hata banner'ı).

#### Sağ (5/12) — Bilgi kartları

**a) "İletişim Bilgilerimiz" kartı** — 4 bilgi satırı, her biri 40×40 ikon kutusu + monospace etiket + değer:

| Etiket | İkon | Link |
|---|---|---|
| E-posta | Zarf | `mailto:` |
| Telefon | Telefon | `tel:` |
| Adres | Konum | — |
| Çalışma Saatleri | Saat | — (yalnız doluysa) |

Yükleniyor: 4 satırlık skeleton (ikon karesi + 2 metin çubuğu).

**b) "Sosyal Medya" kartı** (yalnız en az bir sosyal link doluysa) — 40×40 kare ikon butonları: LinkedIn, Twitter, Instagram, Facebook.

**Bölüm 3 — Konum kartı**
Başlık satırı: "Konumumuz" + sağda "Haritada göster" ipucu.
1. Adres özet bandı: ikon + "İletişim Bilgileri" + adres metni; sağda iki buton ("Büyük Harita" outline, "Yol Tarifi" dolu)
2. Harita gömülü iframe, yükseklik 384px. Yüklenirken üstünde spinner + "Harita yükleniyor..." katmanı.

Yükleniyor durumu: skeleton bloklar.

---

### 5.8 Video galeri — `/{lang}/videos`

**Veri:** `GET /api/public/youtube` (ilk yükleme 50 kayıt) + `GET /api/public/channels`. Sonsuz scroll ile 12'lik sayfalar.

**Bölüm 1 — PageHero:** `title` (varsayılan "Videolar") · `description` · CTA (varsayılan "Videoları Keşfet" → `#video-content`) · breadcrumb açık · `index: 4`.

**Bölüm 2 — Filtre paneli**
- Arama girdisi ("Video ara...") — başlık, açıklama ve etiketlerde arar (client-side)
- Tip toggle pill'leri: `Tümü` · `Video` · `Kısa` — URL'e yazılır
- Kanal select (kanal varsa): "Tüm Kanallar" + `{kanal adı} ({video sayısı})` — URL'e yazılır
- Etiket bölümü (etiket varsa): "Etiketler" başlığı + çoklu seçilebilir pill'ler (AND mantığı)
- "Temizle" butonu (arama veya etiket aktifse)
- Sonuç özeti: `{n} video` + "Filtreleri Temizle"

**Bölüm 3 — Bento grid** (`grid-cols-12`, gap 20px)

| Index | Kolon | Aspect | Açıklama gösterimi |
|---|---|---|---|
| 0 | 12 → 8 (md) | 16:9 | ✓ (`line-clamp-2`) |
| 1 | 12 → 4 (md) | 16:10 | ✓ (`line-clamp-2`) |
| 2+ | 12 → 4 (md) | 16:10 | ✗ |

**Kart içeriği:** thumbnail · sağ üstte tip badge'i (ikon + "Kısa"/"Video") · başlık `line-clamp-2` · açıklama (yalnız ilk 2 kart) · etiketler (large: 4'e kadar, diğerleri: 2'ye kadar) + `+N` · yayın tarihi · hover'da "İzle →".
**Tıklama:** yeni sekmede YouTube'a gider (site içi oynatıcı **yok**).

**Durumlar:** yükleniyor (filtre paneli skeleton + 1 büyük + 7 kart skeleton) · dolu · daha fazla yükleniyor (altta 3 kart skeleton) · liste sonu ("Tüm videolar yüklendi") · boş (filtreli: "Video bulunamadı" + temizle CTA / hiç yok: "Henüz hiç video eklenmemiş...") · hata → **UI yok** ⚠️

---

### 5.9 Hesabım — `/{lang}/account`

Oturum gerektirir. `robots` disallow.

**Kimlik durumları:** yükleniyor (ortalanmış spinner) · oturumsuz (giriş sayfasına yönlendirilir, hiçbir şey render edilmez) · oturumlu (sayfa).

**Bölüm 1 — Karşılama bandı (koyu)**
Avatar (kullanıcı adının baş harfi) · "Merhaba, {ad}" + "Hesap durumunuzu yönetin." · sağda istatistik kartı: `{okunmamış sayı}` + "Mesaj".

**Bölüm 2 — Layout:** `sidebar 3/12` (yapışkan) + `içerik 9/12`

**Sidebar:** 3 sekme butonu (`Mesajlar` — okunmamış badge'i ile, `Adresler`, `Profil`) + ayraç + "Çıkış Yap".

#### Sekme: Mesajlar (varsayılan)
Veri: `GET /api/public/user/messages?page&limit=20`
- **Durumlar:** yükleniyor · boş ("Henüz mesajınız yok") · liste
- **Liste öğesi:** checkbox · ikon (duyuru / sohbet) · konu (fallback "Genel Duyuru" veya "Sorunuz") · tarih · "Duyuru" badge'i (duyuru ise) · gövde veya **konuşma dizisi** (gönderen admin/kullanıcı ayrımlı baloncuklar + zaman damgası)
- **Toplu aksiyon barı** (seçim varken): `{n} mesaj seçildi` + "Seçilenleri Sil"
- **Sayfalama:** "Önceki" · `Sayfa X / Y` · "Sonraki"

#### Sekme: Adresler
Veri: `GET/POST /api/public/user/addresses`, `PUT/DELETE .../{id}`
- **Boş:** "Kayıtlı adresiniz yok"
- **Adres kartı:** başlık · ad soyad · adres · ilçe/şehir · ülke · telefon · "Varsayılan" badge'i · aksiyonlar ("Varsayılan Yap", "Düzenle", "Sil")
- **CTA:** "+ Yeni Adres Ekle"
- **Adres modalı** — başlık "Yeni Adres Ekle" / "Adresi Düzenle". Alanlar: Adres Başlığı*, Ad Soyad*, Telefon*, Ülke (salt okunur "Türkiye"), Şehir*, İlçe*, Adres* (textarea), Posta Kodu, "Varsayılan" checkbox. Aksiyonlar: "Vazgeç" / "Kaydet" (kaydederken "Kaydediliyor...").

#### Sekme: Profil
- Salt okunur alanlar: Ad Soyad, E-posta (+ açıklayıcı yardım metni)
- Şifre bölümü: Mevcut Şifre, Yeni Şifre, "Şifreyi Güncelle" butonu
- ⚠️ Şifre bölümü **işlevsiz** (submit handler yok). Tasarımda ya tamamlanmalı ya çıkarılmalı.

---

### 5.10 Giriş — `/{lang}/login`

Alanlar: E-posta (required, placeholder "ornek@email.com") · Şifre (required, placeholder "••••••••").
Yardımcı link: "Şifremi Unuttum" → `/{lang}/forgot-password` (**sayfa yok**).
Submit butonu; yüklenirken "Giriş Yapılıyor...", devre dışı.
Alt link: "Kayıt Ol" → `/{lang}/register`.
**Hata gösterimi:** yalnız toast — inline hata mesajı yok. Tasarımda inline hata alanı önerilir.
`callbackUrl` query parametresi ile giriş sonrası yönlendirme yapılır.

### 5.11 Kayıt — `/{lang}/register`

Alanlar: Ad Soyad* · E-posta* · Şifre* (min 6) · Şifreyi Onayla* (min 6).
**Client doğrulama:** şifreler uyuşmuyorsa inline hata "Şifreler eşleşmiyor."
Yüklenirken "Kayıt Yapılıyor...".
Başarı: şu an **tarayıcı `alert()`** ile bildiriliyor ⚠️ → tasarımda düzgün başarı ekranı/toast tanımlanmalı.
Hata: inline banner.
Alt link: "Giriş Yap".

### 5.12 Çevrimdışı — `/{lang}/offline` (PWA)

Başlık "You Are Offline" (**metinler İngilizce** ⚠️ — lokalize edilmeli) · nabız atan durum noktası + "No internet connection" · iki CTA ("Try Again" = yenile, "Go Back") · bilgi kutusu "Cached Content Available" · 4 maddelik bağlantı ipucu listesi.

### 5.13 404 — global `not-found`

`404` göstergesi · "Sayfa Bulunamadı" · açıklama · 4 maddelik öneri listesi · CTA'lar ("Ana Sayfaya Dön", "Geri Dön") · popüler sayfalar bloğu (Hizmetlerimiz, Portfolyo, Hakkımızda ⚠️ sayfa yok, İletişim).

### 5.14 Hata — global `error` / `global-error`

"Oops! Bir Hata Oluştu" · açıklama · hata detay kutusu (geliştirmede mesaj, üretimde genel metin + hata kodu) · CTA'lar ("Sayfayı Yenile", "Ana Sayfaya Dön") · yardım bölümü + "İletişime Geç".

### 5.15 Route loading iskeletleri

**Global `loading`:** header nav pill'leri + hero metin çubukları + 2 buton + 6 kartlık grid + sağ altta sabit spinner.
**Portfolyo `loading`:** hero (2 çubuk) + 4 filtre pill'i + 6 kartlık grid.

---

## 6. Paylaşılan Bileşen Envanteri (Figma Component Adayları)

### 6.1 Sayfa düzeyi paylaşılan bileşenler

#### `PageHero` — 5 sayfada kullanılıyor (hizmetler, portfolyo, portfolyo detay, haber listesi, iletişim, videolar)

Yapı (yukarıdan aşağı, hepsi opsiyonel/koşullu):
1. Breadcrumb (`showBreadcrumbs`)
2. Teknik etiket satırı: `index` (sıfır dolgulu, örn. "03") + `badge` metni
3. H1 başlık (`TextReveal` kelime kelime animasyon)
4. `subtitle` (vurgulu, `text-lg/xl`)
5. `description` (maks 65 karakter genişliği)
6. `featuredBadge` (monospace mikro etiket, nokta işaretli)
7. CTA çifti: birincil (dolu, ok ikonlu) + ikincil (outline)
8. Alt ölçü cetveli (dekoratif)

Arka planda blueprint grid bandı.

**Varyantlar:** `default` (min-h 40dvh) · `compact` (min-h 30dvh, daha küçük başlık).

**Sayfa başına gerçek kullanım:**

| Sayfa | `index` | `badge` | `variant` | Buton |
|---|---|---|---|---|
| Hizmetler | 1 | "Hizmetler" | default | "Hizmetleri İncele" → `#services` |
| Portfolyo | 2 | — | default | "Projeleri İncele" → `#projects` |
| Portfolyo detay | 2 | — | **compact** | Yok (`featuredBadge` olabilir) |
| Haber listesi | 3 | — | default | **Yok** |
| Videolar | 4 | — | default | "Videoları Keşfet" → `#video-content` |
| İletişim | 5 | — | default | "İletişim Formu" → `#contact-form` |

#### `Breadcrumbs`

Pathname'den otomatik üretilir. `/` ve `/{lang}` üzerinde **hiç render edilmez**.
İlk kırıntı: ev ikonu (metin ekran okuyucuya). Sonraki kırıntılar i18n sözlüğünden (`haberler`/`noticias` → "Haberler"), eşleşme yoksa slug başlık kalıbına çevrilir. Son kırıntı link değil (`aria-current="page"`).
Maksimum derinlik: 3 seviye (Anasayfa › Bölüm › Sayfa).

---

### 6.2 Kart bileşenleri (aynı iskelet, 4 varyant)

Anasayfadaki üç grid ve haber grid'i **aynı kart iskeletini** paylaşır — Figma'da tek base component + varyant olarak modellenmeli:

```
[Görsel bloğu — değişken aspect]
  └ opsiyonel sol üst badge
  └ opsiyonel hover overlay
─── hairline ───
[Metin bloğu — padding 16/20px]
  └ opsiyonel numaralı teknik etiket
  └ başlık (line-clamp-2)
  └ opsiyonel açıklama/özet (line-clamp-2/3)
  └ meta bloğu (monospace, etiket-değer veya tarih-etiket)
  └ opsiyonel hover spec satırı
```

| Varyant | Aspect | Badge | Meta içeriği |
|---|---|---|---|
| Hizmet kartı | 1:1 | — | Numaralı etiket + hover spec satırı + "Detay →" |
| Portfolyo kartı (anasayfa) | 4:3 | "Öne Çıkan" | Yöntem / Müşteri / Yıl |
| Portfolyo kartı (liste — masonry) | 16:9 / 4:3 / 4:5 | "Öne Çıkan", "3D" | Müşteri / Tarih + hover'da teknoloji etiketleri |
| Haber kartı (anasayfa) | 16:9 | — | Tarih + ilk etiket |
| Haber kartı (liste large) | 4:3 | — | Etiket + tarih üstte, "Devamını Oku" altta |
| Haber kartı (liste default) | 16:10 | — | Aynı |
| Video kartı | 16:9 / 16:10 | Tip badge'i | Etiketler + tarih + "İzle →" |

---

### 6.3 "Precision kit" atomik bileşenler (varyantlarıyla)

Bunlar sitenin yapısal imzasını oluşturur. Figma'da varyant setleri olarak kurulmalı:

| Bileşen | Rol | Varyant/prop |
|---|---|---|
| `TechLabel` | Monospace teknik etiket / eyebrow ("03 / HİZMETLER") | `marker`: `crosshair` \| `tick` \| `none` · `index`: sayı (sıfır dolgulu) veya metin |
| `MeasureRule` | Ölçü cetveli / hairline ayraç | `ticks`: `sparse` \| `normal` \| `dense` · `orientation`: `horizontal` \| `vertical` · `label` + `labelPosition`: `start` \| `center` \| `end` |
| `BlueprintGrid` | Teknik ızgara arka plan katmanı | `density`: `fine` \| `normal` \| `coarse` · `opacity`: `faint` \| `subtle` \| `strong` · `major`: bool |
| `DataStat` | Sayaç istatistik | `value` · `prefix` · `suffix` · `decimals` · `label` |
| `SectionHeader` | Bölüm başlığı | `eyebrow` · `title` · `subtitle` · `align`: `left` \| `center` · `eyebrowVariant`: `default` \| `light` \| `dark` |
| `EmptyState` | Boş durum | `icon` · `title` · `description` · `action` |
| `ErrorState` | Hata durumu | ikon + mesaj + retry slotu |
| `MarqueeStrip` | Kesintisiz kayan şerit | `speed` · `pauseOnHover` |
| `MagneticButton` | İmleç çeken buton | wrapper |
| `ScrollReveal` / `TextReveal` | Görünüm animasyon sarmalayıcıları | `mode`: `word` \| `char` · `stagger` · `mask` |
| `Pagination` | Sayfa numaraları | Kullanılıyor ama haber listesi kendi inline sayfalamasını yazıyor ⚠️ |

**Skeleton seti:** `SkeletonText` (satır sayısı) · `SkeletonCard` (`withMedia` bool) · `SkeletonGrid` (`count`) · `SkeletonHero`.

**Not:** Bölümlerin **görsel imzası** şu 3 öğeye dayanıyor: (a) monospace numaralı teknik etiketler, (b) hairline ölçü cetvelleri, (c) blueprint ızgara katmanları. Yeni tasarımda bu dilin korunup korunmayacağı **stratejik karar** — koruyacaksanız yukarıdaki varyantları modellemek gerekir.

---

### 6.4 Form kontrolleri envanteri

Tüm public formlarda kullanılan kontrol tipleri (Figma'da state'leriyle tasarlanmalı):

| Kontrol | Kullanıldığı yer | Gerekli state'ler |
|---|---|---|
| Metin girdisi (48px) | İletişim, teklif modalı, giriş, kayıt, adres modalı | default · focus · filled · error · disabled |
| E-posta / tel girdisi | Aynı | Aynı |
| Şifre girdisi | Giriş, kayıt, profil | + göster/gizle (şu an yok) |
| Textarea | İletişim (5 satır), teklif modalı (4 satır), adres | default · focus · error |
| Select | Teklif modalı (3×), portfolyo sıralama, video kanal | default · open · selected |
| Checkbox | Portfolyo gelişmiş filtre, adres varsayılan, mesaj seçimi | unchecked · checked · focus |
| Date girdisi | Portfolyo tarih aralığı | default · focus |
| Arama girdisi (ikonlu) | Header, arama modalı, portfolyo, haber, video, mobil menü | default · focus · filled (temizle butonlu) |
| Pill / toggle | Kategori filtresi, etiket filtresi, video tipi | inactive · active · hover |
| Birincil buton | Her yerde | default · hover · active · loading · disabled |
| Outline buton | Bölüm CTA'ları | default · hover |
| İkon buton (40×40) | Carousel okları, sosyal, lightbox | default · hover · focus |

**Feedback bileşenleri:** başarı banner'ı (check ikonlu) · hata banner'ı (uyarı ikonlu) · toast (sonner) · inline alan hatası.

---

## 7. Veri Modeli → İçerik Slot Eşlemesi

Bu tablo, tasarımda **hangi metnin nereden geldiğini** ve dolayısıyla **uzunluğunun ne kadar değişken olabileceğini** gösterir. Üç kategori:

- **CMS** — yöneticinin girdiği içerik → **uzunluğu öngörülemez**, tasarım esnek olmalı
- **i18n** — çeviri dosyasından, sabit ama dile göre değişir (ES metinleri TR'den ~%15 uzun)
- **Kod** — kaynak kodda gömülü, değiştirmek kod değişikliği gerektirir

### 7.1 Veritabanı modelleri (public tarafı ilgilendirenler)

| Model | Public kullanım | Kritik alanlar |
|---|---|---|
| `SiteSettingsRow` | Header/footer logo & ad, metadata | `siteName`, `logoText`, `slogan`, `description`, `logo` (JSON: url/alt/w/h), `favicon`, `socialMedia` (JSON), `seo` (JSON) |
| `FooterSettingsRow` | Footer tamamı | `mainDescription`, `contactInfo` (email/phone/address), `quickLinks[]` (title/url/isExternal), `socialLinks` (6 platform), `copyrightInfo` (companyName/year/additionalText), `developerInfo`, `visibility` (4 bool) |
| `PageSettingRow` | **Header navigasyonu** + sayfa hero'ları | `pageId`, `title`, `description`, `path`, `icon`, `order`, `showInNavigation`, `isActive`, `buttonText`, `buttonLink` |
| `SliderRow` | Anasayfa hero slide'ları | `title`, `subtitle`, `description`, `buttonText`, `buttonLink`, `badge`, `imageUrl`, `order`, `duration` (ms), `isActive` |
| `ServiceRow` | Hizmetler grid + detay | `title`, `description` (HTML), `features[]`, `image`, `icon`, `slug`, `order`, `translations` (JSON) |
| `PortfolioRow` | Portfolyo listesi + detay | `title`, `slug`, `description` (HTML), `content`, `coverImage`, `images[]`, `technologies[]`, `category`, `categoryIds[]`, `client`, `completionDate`, `models3D` (JSON), `featured`, `projectUrl`, `githubUrl`, `externalUrl`, `translations` |
| `NewsRow` | Haber listesi + detay | `title`, `slug`, `excerpt`, `content`, `featuredImage` (JSON: url/altText), `author`, `status`, `category`, `tags[]`, **`translations`** (JSON: `{tr:{title,excerpt,content,keywords},es:{...}}`), `views`, `relatedPortfolioIds[]`, `relatedNewsIds[]`, `publishedAt` |
| `CategoryRow` | Portfolyo filtreleri | `name`, `slug`, `description`, `order` |
| `VideoRow` | Video galeri | `videoId`, `title`, `description`, `thumbnail`, `publishedAt`, `type` (`normal`/`short`), `status`, `tags[]`, `channelId`, `channelName` |
| `Model3DRow` | Hero 3D önizleme | `name`, `fileUrl`, `thumbnail`, `filetype`, `fileSize` |
| `UserRow` | Hesap sayfası | `name`, `email`, `role`, `addresses` (JSON dizi) |
| `MessageRow` | İletişim formu hedefi + hesap mesajları | `name`, `email`, `subject`, `message`, `status`, `type`, `conversation` (JSON dizi), `adminReply` |
| `ContactRow` | İletişim formu kayıtları | `name`, `email`, `phone`, `subject`, `message`, `status` |
| `LanguageRow` | Dil değiştirici | `code`, `label`, `nativeLabel`, `flag`, `isDefault`, `direction` |

**Yapısal notlar:**
- Prisma'da **hiç ilişki (relation) tanımı yok** — kategori bağı string ID dizileriyle kuruluyor.
- Enum yok — `status`, `type`, `role` düz string.
- `translations` alanları JSON — **her haber, hizmet ve proje iki dilde ayrı başlık/özet/içerik taşır.**

### 7.2 İçerik uzunluk kısıtları (kodda tanımlı, tasarımı bağlar)

| Yer | Kısıt |
|---|---|
| Hizmet kartı açıklaması | 80 karaktere kırpma + `line-clamp-2` |
| Hizmet kartı hover spec satırı | İlk 3 `feature`, ` · ` ile birleşik, **tek satır truncate** |
| Portfolyo kart başlığı | `line-clamp-2` |
| Portfolyo kart açıklaması (liste) | `line-clamp-2` |
| Portfolyo hover teknoloji etiketleri | Maks 3 + `+N` |
| Haber kart başlığı | `line-clamp-2` |
| Haber kart özeti (anasayfa / hero) | `line-clamp-2` |
| Haber kart özeti (liste kartı) | `line-clamp-3` |
| Video kart başlığı | `line-clamp-2` |
| Video kart etiketleri | Large 4, diğer 2 + `+N` |
| Hero açıklaması | Maks `58ch` |
| PageHero açıklaması | Maks `65ch` |
| Bölüm alt metni | Maks `65ch` |
| Portfolyo detay ilişkili haber başlığı | `line-clamp-2` |
| Footer açıklaması | Maks `20rem` genişlik |

### 7.3 Sabit içerik envanteri (i18n, TR)

Bu metinler CMS'ten gelmiyor — çeviri dosyasında tanımlı. Tasarımda **gerçek metin** olarak kullanılabilir:

**Anasayfa hero varsayılanları:** badge "Endüstriyel Çözümler" · başlık "Mühendislikte Sınırsız Hassasiyet" · açıklama "3D tarama, tersine mühendislik ve prototipleme ile projelerinize ölçülebilir değer katın." · CTA "Projeleri İncele" / "İletişime Geç" · spec `TOLERANS ±0.05 MM` / `TARAMA 20 µM` / `STL / STEP / OBJ`

**Yetkinlikler (9):** 3D Tarama · Tersine Mühendislik · FDM · SLA · SLS · CMM · CAD Modelleme · Prototipleme · Kalite Kontrol

**Bölüm başlıkları:** Hizmetler → "Sunduğumuz Çözümler" · Süreç → "Taramadan Üretime" · Portfolyo → "Öne Çıkan Projeler" · Haberler → "Son Gelişmeler" · CTA → "Projenizi Hayata Geçirelim"

**Navigasyon:** Anasayfa · Portfolyo · Hizmetler · Haberler · İletişim · Videolar · Giriş Yap · Kayıt Ol · Hesabım · Çıkış Yap

**Hizmet adları (13 tanımlı i18n anahtarı):** 3D Tarama · Tersine Mühendislik · 3D Baskı Hizmetleri · Prototipleme Hizmetleri · Plastik Restorasyon · 3D Modelleme Hizmetleri · Araç Restorasyon · Restorasyon Danışmanlık · Dijital Yapay Zeka Çözümleri · Web ve İnteraktif Çözümler · Extreme ECU Çözümleri · Kurumsal & Bireysel Yazılım Çözümleri · Markalaşma Danışmanlığı

**Footer başlıkları:** Hızlı Bağlantılar · Hizmetler · İletişim · Geliştiren · Yukarı Çık

Tam liste: `messages/tr.json` ve `messages/es.json`. Üst düzey anahtarlar: `home` · `common` · `nav` · `header` · `breadcrumb` · `hero` · `news` · `portfolio` · `services` · `contact` · `auth` · `footer` · `pagination` · `videos` · `meta`.

---

## 8. Durum Matrisi (Her Veri Yüzeyi İçin)

Figma'da her aşağıdaki hücre bir frame gerektirir:

| Yüzey | Yükleniyor | Boş | Hata | Dolu | Ekstra |
|---|---|---|---|---|---|
| Anasayfa hero | — (i18n fallback) | — (asla boş olmaz) | — (sessiz) | ✓ | 1 slide / N slide |
| Hero 3D paneli | ✓ spinner | ✓ statik poster | ✓ statik poster | ✓ canlı viewer | reduced-motion → poster |
| Anasayfa hizmet grid'i | ✓ 6 skeleton | ✓ + CTA | — (boşa düşer) | ✓ | Hover spec açık |
| Anasayfa portfolyo grid'i | ✓ 8 skeleton | ✓ + CTA | — (boşa düşer) | ✓ | Hover scan-line |
| Anasayfa haber grid'i | ✓ 3 skeleton | ✓ | — (boşa düşer) | ✓ | — |
| Hizmet gezgini | ✓ sidebar+detay | ✓ + mesaj | ✓ + retry | ✓ | Aktif/pasif sidebar öğesi |
| Portfolyo listesi | ✓ masonry skeleton | ⚠️ **UI yok** | ✓ tam ekran | ✓ | Filtre sonucu boş: ✓ |
| Portfolyo medya galerisi | — | ✓ "Medya bulunamadı" | — | ✓ | Lightbox açık: ✓ |
| Haber listesi | (server render) | ✓ + CTA | ✓ error.tsx | ✓ | Arama/etiket aktif: ✓ · sayfalama: ✓ |
| Haber detayı | (server render) | — | ✓ error.tsx | ✓ | İlgili bölümler koşullu |
| İletişim formu | ✓ bilgi skeleton | — | ✓ banner | ✓ | Gönderiliyor: ✓ · başarılı: ✓ |
| Video galerisi | ✓ 8 skeleton | ✓ 2 varyant | ⚠️ **UI yok** | ✓ | Daha fazla yükleniyor: ✓ · liste sonu: ✓ |
| Hesap mesajları | ✓ spinner | ✓ | — | ✓ | Toplu seçim: ✓ · sayfalama: ✓ |
| Hesap adresleri | ✓ | ✓ | — | ✓ | Modal: ekle/düzenle |
| Arama modalı | ✓ spinner | ✓ sonuç yok | — | ✓ | Boş sorgu → hızlı linkler |
| Teklif modalı | ✓ buton | — | ✓ banner | ✓ | Başarılı: ✓ |
| Giriş / Kayıt | ✓ buton | — | toast / inline | ✓ | — |
| Route geçişi | ✓ global skeleton | — | ✓ error.tsx | — | Loading bar |
| Bağlantı yok | — | — | — | — | ✓ offline sayfası |

---

## 9. Etkileşim ve Davranış Kuralları

### 9.1 Scroll'a bağlı davranışlar

| Tetik | Etki |
|---|---|
| `scrollY > 8` | Header saydamdan opağa geçer (yalnız anasayfada fark eder) |
| `scrollY > 300` | Back-to-top butonu görünür |
| Scroll ilerlemesi | Haber detayda okuma progress bar'ı dolar |
| Bölüm görünüm alanına girer | Bölüm içeriği `once: true` ile fade/blur/y animasyonuyla girer |
| İstatistik görünür olur | Sayaçlar sıfırdan hedefe artar (bir kez) |
| Video listesi sonu görünür | Sonraki 12 video yüklenir (IntersectionObserver) |

### 9.2 Hover davranışları (masaüstü)

| Öğe | Etki |
|---|---|
| Hizmet kartı | Kenarlık vurgusu + başlık renk değişimi + **spec satırı açılır** |
| Portfolyo kartı (anasayfa) | Kenarlık + başlık + **scan-line overlay** |
| Portfolyo kartı (liste) | **Teknoloji etiketli overlay** + görsel zoom |
| Haber kartı | Kenarlık + hafif yukarı kalkma + görsel zoom (1.04) |
| Video kartı | "İzle →" görünür |
| Header arama | Genişlik 192px → 256px |
| "Teklif Al" butonu | Magnetic (imleci takip eden hafif kayma) |
| Marquee şerit | Durur |
| Hero carousel | Autoplay duraklar (yalnız fare, dokunmatikte hayır) |
| Buton/link ok ikonları | Sağa 2px kayar |

### 9.3 Klavye

| Tuş | Etki |
|---|---|
| `Tab` | Odak sırası; skip-link ilk odaklanabilir öğe |
| `Ctrl/Cmd + K` | Arama modalı aç/kapa |
| `Esc` | Arama modalı, mobil menü, lightbox kapanır |
| `←` / `→` | Hero carousel slide değişimi; lightbox medya değişimi |

### 9.4 `prefers-reduced-motion` davranışı (zorunlu)

Tüm animasyonlar bu ayarı **saygı gösterir**. Tasarımda hareketsiz alternatif düşünülmeli:

- Hero carousel autoplay **tamamen kapanır** (manuel kontrol kalır)
- Scroll reveal animasyonları → anında görünür (opacity 1)
- Sayaçlar → anında hedef değer
- Hero 3D paneli → **canlı viewer yerine statik poster**
- Portfolyo scan-line overlay → gizli
- Hizmet kartı hover spec satırı → **her zaman açık**
- Görsel zoom / kart kalkma → yok
- Smooth scroll → anlık atlama

### 9.5 Dokunmatik

- Hero carousel: yatay swipe, eşik 60px
- Hizmet sidebar (`<lg`): yatay kaydırılabilir pill satırı
- İlgili haberler şeridi: snap davranışlı yatay scroll
- Hover'a bağlı içerik (hizmet spec satırı, portfolyo teknoloji overlay'i) **dokunmatikte erişilemez** ⚠️ — tasarımda alternatif düşünülmeli

---

## 10. Erişilebilirlik Gereksinimleri (kodda uygulanmış, korunmalı)

- **Skip link:** "Ana içeriğe atla", `#main-content` hedefi, focus'ta görünür
- **Landmark'lar:** `role="banner"` (header + hero), `<main>`, `role="contentinfo"` (footer), `<nav>` etiketli
- **Hero carousel:** `aria-roledescription="carousel"`, dot'lar `role="tab"` + `aria-selected`, ekran okuyucuya `n / total` canlı bildirim
- **Odak göstergesi:** tüm interaktif öğelerde `focus-visible` ring + offset — **tasarımda tanımlanmalı**
- **Dekoratif katmanlar:** blueprint grid, ölçü cetveli, grain, marquee → `aria-hidden="true"`
- **Semantik listeler:** grid'ler `<ul>/<li>`, süreç akışı `<ol>`, spec tabloları `<dl>/<dt>/<dd>`
- **Görsel alt metinleri:** haber görselleri `featuredImage.altText`'ten, aksi halde başlıktan
- **Form etiketleri:** her girdinin `<label htmlFor>` bağı var
- **`prefers-reduced-motion`** desteği (bkz. 9.4)
- Kontrast testi için bir script mevcut (`npm run contrast`) — yeni palette çalıştırılmalı

---

## 11. Public API Uçları (tasarımın beslendiği veri kaynakları)

| Uç | Kullanan yüzey | Not |
|---|---|---|
| `GET /api/public/slider` | Anasayfa hero | Dizi döner, `order` sıralı |
| `GET /api/public/services?limit=` | Anasayfa grid (6), Hizmetler sayfası (tümü) | Dizi |
| `GET /api/public/portfolio?limit=&category=&featured=&random=` | Anasayfa vitrini (8), arama modalı | Dizi |
| `GET /api/public/portfolio/slug/{slug}` | Proje detayı | Normalize nesne |
| `GET /api/public/news?page=&limit=&status=&search=` | Anasayfa (3), arama modalı | `{success, data:{items, pagination}}` |
| `GET /api/public/news/slug/{slug}` | Haber detayı | — |
| `GET /api/public/categories` | Portfolyo filtreleri | Dizi |
| `GET /api/public/3dmodels?limit=` | Hero 3D paneli | Portfolyo içine gömülü modellerden |
| `GET /api/public/3dmodels/download?url=&filename=` | Lightbox / dosya listesi | İkili akış |
| `GET /api/public/youtube?limit=&type=&status=&pageToken=&channelId=` | Video galerisi | `{videos, nextPageToken, totalResults}` |
| `GET /api/public/channels` | Video kanal filtresi | Dizi |
| `GET /api/public/contact-info` | İletişim sayfası | `{email, phone, address, workingHours, socialLinks}` |
| `POST /api/public/contact` | İletişim formu **ve** teklif modalı | `{name, email, subject, message}` |
| `GET /api/public/settings` | Header + footer logo/ad | — |
| `GET /api/public/footer-settings` | Footer | Tam footer nesnesi |
| `GET /api/public/languages` | Dil değiştirici | `{success, data:[...]}` |
| `GET /api/public/user/messages?page=&limit=` | Hesap → Mesajlar | `{success, data, pagination, unreadCount}` |
| `GET/POST /api/public/user/addresses` | Hesap → Adresler | — |
| `POST /api/public/register` | Kayıt | — |
| `/api/auth/*` | NextAuth (giriş, çıkış, şifre sıfırlama) | — |

⚠️ Header navigasyonu ve bazı sayfa hero'ları **`/api/admin/page-settings`** ucundan okunuyor (public GET'e izinli). Yapısal bir kusur ama tasarımı etkilemiyor.

---

## 12. Tasarım Öncesi Karar Gerektiren Noktalar

Kodda tespit edilen tutarsızlıklar ve eksikler. Yeni tasarımda bunlara karar verilmeli:

### 12.1 Yapısal tutarsızlıklar

| # | Konu | Detay | Öneri |
|---|---|---|---|
| 1 | **Container genişliği** | Tüm sayfalar 1280px, **haber detayı 1400px** (inline stil) | Tek genişliğe indir |
| 2 | **Container padding** | Standart 16/24/32px, haber detayı 24/32/64px | Standardize et |
| 3 | **Sayfalama** | Haber listesi kendi inline sayfalamasını yazıyor, `ui/Pagination` bileşeni kullanılmıyor; **ellipsis yok** (20 sayfa = 20 buton) | Tek sayfalama bileşeni + ellipsis deseni |
| 4 | **Kategori filtresi** | Pill barında **tek seçim**, gelişmiş panelde **çoklu seçim** — aynı veriye iki farklı mantık | Tek mantığa indir |
| 5 | **Portfolyo sayfalama yok** | 100 proje tek seferde yüklenip client'ta filtreleniyor | Sunucu sayfalama veya "daha fazla yükle" |
| 6 | **Arama davranışı farkı** | Header araması modal açar (API sorgular), mobil menü araması haber sayfasına yönlendirir | Tek davranış |
| 7 | **Bölüm numaralandırma** | Anasayfada `01–04`, alt sayfalarda `1–5` — tutarsız numaralandırma şeması | Şemayı netleştir |
| 8 | **CTA tekrarı** | Neredeyse her sayfa sonunda "İletişime geç" CTA bandı var (anasayfa, hizmetler, portfolyo, proje detay) | Hiyerarşi kur, tekrarı azalt |

### 12.2 Eksik yüzeyler

| # | Eksik | Etki |
|---|---|---|
| 9 | `/{lang}/about` sayfası | 404 sayfası ve sitemap'te linkli, sayfa yok |
| 10 | `/{lang}/forgot-password` sayfası | Giriş sayfasından linkli, sayfa yok |
| 11 | Portfolyo listesi "hiç proje yok" durumu | Hiçbir şey render edilmiyor (boş sayfa) |
| 12 | Video galerisi hata durumu | UI yok, sadece konsol logu |
| 13 | Kayıt başarı ekranı | Tarayıcı `alert()` kullanılıyor |
| 14 | Giriş inline hata mesajı | Sadece toast var |
| 15 | Hesap → Profil şifre değiştirme | UI var, işlev yok |
| 16 | Çevrimdışı sayfası lokalizasyonu | Metinler İngilizce |
| 17 | OG görsel şablonu | Dinamik `opengraph-image` route'u yok, statik dosya |
| 18 | PWA kurulum istemi | Bileşen var (`PWAInstallPrompt`) ama hiçbir yere bağlı değil |
| 19 | Arama modalında "Hizmetler" kategorisi | Tanımlı ama API sorgulanmıyor |
| 20 | Hover'a bağlı içeriğin dokunmatik alternatifi | Hizmet spec satırı ve portfolyo teknoloji overlay'i mobilde erişilemez |

### 12.3 Şemada olmayan ama UI'da beklenen alanlar

| Alan | Görünen yer | Durum |
|---|---|---|
| `Service.duration` | Hizmet detay meta şeridi | Prisma'da **yok** — her zaman boş |
| `Service.rating` | Hizmet detay meta şeridi | Prisma'da **yok** |
| `Service.price` | Hizmet detay meta şeridi | Prisma'da **yok** |
| Portfolyo `Durum` | Proje detay bilgi tablosu | **Sabit** "Tamamlandı" — veriden gelmiyor |
| İstatistik değerleri | Anasayfa stats bandı | **Sabit kod** (150 proje, ±0.05mm, 20µm, yıl hesabı) |

### 12.4 Kullanılmayan / terk edilmiş bileşenler

Tasarımda **hesaba katılmamalı** (kodda var, hiçbir sayfada mount edilmiyor):
`NewsCarousel` (Swiper) · `PortfolioFilters` · `PortfolioDetailHero` · `HomePortfolioSection` · `ModelGallery` · `PortfolioImageGallery` (kök) · `ProjectCard`/`ProjectGrid` (legacy) · `ServicesClient` (alternatif hizmetler sayfası) · `SmartLink` · `ErrorBoundary` · `FloatingCta` · `PWAInstallPrompt` · `SectionWrapper` · `RevealStagger`

---

## 13. Önerilen Figma Dosya Kurgusu

### Figma sayfa yapısı

| Figma sayfası | İçerik |
|---|---|
| `00 — Foundations` | Grid/layout kuralları, breakpoint frame'leri, spacing skalası, container tanımları, z-index haritası |
| `01 — Components / Primitives` | Buton, girdi, select, checkbox, badge, pill, ikon buton, skeleton — tüm state'leriyle |
| `02 — Components / Precision Kit` | `TechLabel`, `MeasureRule`, `BlueprintGrid`, `DataStat`, `SectionHeader`, `EmptyState`, `ErrorState` — varyant setleri |
| `03 — Components / Cards` | Base kart + 7 varyant (bkz. 6.2) |
| `04 — Components / Shell` | Header (masaüstü/mobil/scroll durumları), Footer, Breadcrumb, Pagination, Back-to-top |
| `05 — Components / Overlays` | Mobil menü, arama modalı, teklif modalı, lightbox, dil dropdown, hesap dropdown, adres modalı, toast |
| `10 — Home` | Anasayfa: 8 bölüm × 3 breakpoint + tüm bölüm state'leri |
| `11 — Services` | Hizmetler sayfası + 4 state |
| `12 — Portfolio` | Liste (filtre açık/kapalı, sonuç yok) + detay |
| `13 — News` | Liste (öne çıkan var/yok, filtreli, sonuç yok, sayfalama) + detay |
| `14 — Contact` | Form + 4 state |
| `15 — Videos` | Galeri + 5 state |
| `16 — Account & Auth` | Hesap 3 sekme + giriş + kayıt |
| `17 — System Pages` | 404, hata, offline, loading skeleton'ları |
| `18 — Prototypes` | Ana akış prototipleri |

### Frame sayısı tahmini

| Kategori | Yaklaşık frame |
|---|---|
Sayfa tasarımları (3 breakpoint × 14 sayfa) | ~42
Sayfa state varyasyonları | ~35
Overlay / modal | ~12
Bileşen varyant setleri | ~25 set
**Toplam** | **~90 frame + 25 component set**

### Öncelik sırası

1. **Foundations + Header/Footer** — her şeyin temeli
2. **Kart base component + varyantları** — sitenin en tekrar eden yapısı
3. **Anasayfa** (8 bölüm) — en yoğun ve en görünür sayfa
4. **Portfolyo listesi + detay** — iş vitrini
5. **Hizmetler** — dönüşüm sayfası
6. **Haber listesi + detay** — içerik motoru
7. **İletişim + teklif modalı** — dönüşüm noktası
8. **Videolar**
9. **Hesap / auth / sistem sayfaları**

---

## 14. Özet — Tasarımı Bağlayan 12 Yapısal Gerçek

1. **Header sabittir ve 56px yüksekliktedir.** Tüm hero'lar bunu üstten telafi eder.
2. **Container 1280px + 16/24/32px yatay padding.** Tek istisna haber detayı (1400px) — düzeltilmeli.
3. **Navigasyon linkleri CMS'ten dinamiktir.** Sayısı ve etiket uzunluğu sabit değil.
4. **Site iki dillidir** ve haber URL segmenti dile göre değişir (`haberler` ↔ `noticias`).
5. **Anasayfa 8 bölümden oluşur** ve sırası sabittir: hero → yetkinlikler → hizmetler → süreç → portfolyo → istatistik → haberler → CTA.
6. **Anasayfadaki 3 grid aynı kart iskeletini paylaşır** (2/3/4 kolon, gap 16px) — tek base component.
7. **Portfolyo listesi 6'lık tekrarlı masonry deseni kullanır** (8/4/4/8/6/6 kolon, aspect 16:9/4:5/4:5/16:9/4:3/4:3).
8. **Haber listesi asimetrik 7/5 kolon deseni kullanır** ve ilk sayfada öne çıkan hero kartı vardır.
9. **Zengin metin (HTML) iki yerde basılır:** haber detay gövdesi ve proje detay açıklaması — tipografi hiyerarşisi tanımlanmalı.
10. **Her veri yüzeyinin en az 3 durumu vardır** (yükleniyor / boş / dolu); bazılarında hata + başarı da var.
11. **`prefers-reduced-motion` tüm animasyonları devre dışı bırakır** ve bazı bileşenlerin (hero 3D, hizmet spec satırı) yapısını değiştirir.
12. **Sitenin yapısal imzası 3 öğeye dayanır:** monospace numaralı teknik etiketler, hairline ölçü cetvelleri, blueprint ızgara katmanları. Bu dilin korunup korunmayacağı tasarımın ilk stratejik kararıdır.
