# Fixral — Public Brand & Visual System (v1)

> Görsel karar katmanı. Yapısal kaynak: `FIGMA-PUBLIC-CONTEXT.md`.
> Kapsam: public sayfalar, desktop 1440 (responsive kurallar tanımlı; mobil/tablet frame’leri sonraki sprint).
> Figma: [Fixral — Public Site](https://www.figma.com/design/IbkY9oodMx7lwTHXrJ8HDp)

---

## 0. Tasarım tezi

Fixral bir ajans sitesi değil; **ölçülebilir mühendislik stüdyosu**. Ziyaretçi parçayı taratır, modeli doğrular, üretime geçer. Arayüz bu işi *hisssettirmeli* — CAD yazılımı kopyalamadan, SaaS şablonuna da düşmeden.

**Kavram adı: Fiducial.** Optik tarayıcıların referans işaretleri: küçük, keskin, tekrar eden, asla gürültülü olmayan.

Üç imza (yapı korunur, görsel evrilir):

| Eski (kod) | Yeni (v1) | Neden |
|---|---|---|
| Crosshair `+` | **6×6 fiducial kare** (1px stroke, içi boş) | Daha az “HUD / sci-fi”, daha çok metroloji hedefi |
| Tam sayfa blueprint grid | **Sadece koyu yüzeylerde 4 köşe fiducial** (hero, CTA, 3D panel) | Grid duvar kâğıdı gibi yıpranmış; köşe işaretleri yeter |
| Hairline cetvel | **Datum line:** 1px çizgi + her 32px’de 8px tick, her 128px’de 12px major tick | Ölçü dili korunur, daha okunaklı |

Turuncu **tek yüksek ses**. Cyan **yalnız 3D / ölçüm** bağlamında. Diğer her şey grafit, kağıt, mürekkep.

---

## 1. Bölüm 12 kararları (kilitlendi)

| # | Karar |
|---|---|
| 1 | Container **her yerde 1280px**. Haber detayı 1400 istisnası kalkar. |
| 2 | Yatay padding **16 / 24 / 32** (mobil / sm / lg). |
| 3 | Tek `Pagination`: 40×40 numara, Geist Mono, ellipsis. |
| 4 | Kategori: pill bar **tek seçim**. Gelişmiş panel yalnız teknoloji + tarih (çoklu). |
| 5 | Portfolyo: ilk 12 + **Daha fazla yükle** (100’lük client dump yok). |
| 6 | Arama **her zaman modal** (mobil menüdeki `?q=` yönlendirmesi kalkar). |
| 7 | Bölüm index **her zaman** `01`–`08` (sıfır dolgulu). |
| 8 | Tam genişlik CTA **yalnız anasayfa + iletişim**. Header’daki Teklif Al her sayfada durur. Hizmet/portfolyo/proje sonundaki tekrar bantları kalkar. |
| 9 | `/{lang}/about` **tasarlanır** (kısa stüdyo sayfası). `/{lang}/forgot-password` **tasarlanır**. |
| 10 | Hizmet meta şeridinden süre / puan / fiyat **çıkar** (şemada yok). |
| 11 | Proje “Durum” satırı **yok**; “Tamamlandı” uydurulmaz. |
| 12 | Hover’a bağlı spec/overlay **dokunmatikte her zaman açık** (desktop’ta hover). |

---

## 2. Renk

Kaynak: `src/app/globals.css` → `.public-theme` / `.public-theme.public-dark`. Dual theme zorunlu (header toggle).

### 2.1 Primitive

| Token | Light | Dark | Rol |
|---|---|---|---|
| `orange` | `#FA6831` | `#FA6831` | Brand fill, aktif, CTA |
| `ink` | `#221F1C` | `#E5E9EC` | Birincil metin |
| `ink-on-brand` | `#1C1C1C` | `#1C1C1C` | Turuncu üzerindeki metin (5.75:1) |
| `paper` | `#F9F8F6` | `#0B0D10` | Sayfa zemini |
| `white` / `card` | `#FFFFFF` | `#14171B` | Kart yüzeyi |
| `paper-band` | `#EFEDE9` | `#0F1215` | Bölüm bandı |
| `muted` | `#6C645F` | `#9BA3AB` | İkincil metin |
| `hairline` | `#E2DFD9` | `#262B31` | 1px ayraç |
| `accent-soft` | `#FFECE6` | `#432419` | Seçili / hover dolgu |
| `accent-ink` | `#9E3F17` | `#FC895F` | Soft zemin üzeri metin |
| `focus` | `#F55014` | `#FA6831` | Focus ring |
| `scan` | `#1863DC` (light info) | `#3FC9E9` | Yalnız 3D / ölçüm vurgusu |
| `danger` | `#CB2C2C` | `#EF6C6C` | Hata |
| `success` | `#3E6F06` | `#5CAD0B` | Başarı |

### 2.2 Kullanım kuralı

- Turuncu **dolgu** olarak: birincil buton, aktif pill, progress bar, okuma çubuğu.
- Turuncu **metin** olarak: hover’daki başlık, aktif nav, link. Gövde metninde kullanılmaz.
- Sayfa zemininde turuncu mesh / gradient **yok**. Hero scrim nötr grafit.
- Kart derinliği gölgeden değil **zemin farkı + hairline**’dan gelir.

### 2.3 Focus

`2px` ring, `offset 2px`, renk `focus`. Tüm interaktif öğelerde `focus-visible`. Skip-link aynı ring + opak zemin.

---

## 3. Tipografi

Ürün fontları (kod + Figma’da yüklü). Inter kullanılmaz.

| Rol | Aile | Ağırlıklar |
|---|---|---|
| Display + UI | **Barlow** | 300 Light, 400 Regular, 500 Medium, 600 SemiBold, 700 Bold |
| Spec / index / meta | **Geist Mono** | 400 Regular, 500 Medium, 700 Bold |

### 3.1 Desktop 1440 type ramp

| Stil | Font | Size / LH | Tracking | Kullanım |
|---|---|---|---|---|
| Display/Hero | Barlow Bold | 72 / 76 | −0.045em | Anasayfa H1 (1–3 satır) |
| Display/Page | Barlow Bold | 56 / 62 | −0.03em | PageHero H1 |
| Display/Page Compact | Barlow Bold | 40 / 44 | −0.03em | Proje detay H1 |
| Heading/H2 | Barlow SemiBold | 40 / 48 | −0.035em | Bölüm başlığı |
| Heading/H3 | Barlow SemiBold | 22 / 28 | −0.02em | Kart başlığı, form H3 |
| Heading/H4 | Barlow Medium | 16 / 22 | −0.01em | CTA kart, sidebar |
| Body/Lead | Barlow Regular | 18 / 28 | 0 | Hero açıklama, PageHero desc (max 58–65ch) |
| Body/Regular | Barlow Regular | 16 / 26 | 0 | Zengin metin paragrafı |
| Body/Small | Barlow Regular | 14 / 22 | 0 | Kart açıklama, form yardım |
| Button/Label | Barlow Medium | 14 / 20 | +0.01em | Tüm butonlar |
| Tech/Label | Geist Mono Medium | 11 / 16 | +0.14em | `01 / HİZMETLER`, eyebrow |
| Meta/Mono | Geist Mono Regular | 10 / 14 | +0.14em | Spec satırı, tarih, kbd |
| Nav/Index | Geist Mono Regular | 10 / 14 | +0.08em | Header `01` `02` |

H1/H2 `text-wrap: balance`. Paragraflar `pretty`. Tabular nums: Geist Mono + `tabular-nums` (sayfa numarası, istatistik).

### 3.2 Zengin metin (haber + proje gövdesi)

Aynı ramp, dar kolon **768px**:

| HTML | Stil |
|---|---|
| `h2` | Heading/H3, üst 40 / alt 16 |
| `h3` | Heading/H4, üst 32 / alt 12 |
| `p` | Body/Regular, alt 20 |
| `a` | `accent-ink` / dark’ta `orange`, underline offset 3px |
| `blockquote` | sol 3px `orange`, pl 20, italic Body/Lead |
| `code` | Geist Mono 13, `accent-soft` zemin, radius 2 |
| `pre` | kart zemin, hairline, p 20, Geist Mono 13/22 |
| `ul/ol` | Body/Regular, gap 8, marker `orange` |
| `img` | radius 4, hairline, alt 24 |
| `table` | hairline hücre, Meta/Mono başlık satırı |

---

## 4. Layout (responsive kurallı, şimdi yalnız 1440)

### 4.1 Frame’ler

| Frame | Genişlik | Bu sprint |
|---|---|---|
| Desktop | **1440** | Evet |
| Tablet | 768 | Hayır (grid kuralları yazılı) |
| Mobile | 390 | Hayır |

### 4.2 Grid

```
Canvas 1440
├─ margin 80  (= (1440 − 1280) / 2)
└─ container 1280
    ├─ padding-x 32
    └─ content 1216
```

12 kolon, gutter **16px** (kart grid’leri). Bölüm içi büyük gap: 32 / 48 / 64.

Breakpoint davranışı (kod değişmez):

| Eşik | Ne değişir |
|---|---|
| `< md` (768) | 1–2 kolon, süreç dikey, header hamburger |
| `md` | 3 kolon kart, süreç 4 kolon, footer 2 kolon |
| `lg` (1024) | Header tam nav, hizmet sidebar, proje 8+4, footer 4 kolon |

### 4.3 Dikey ritim

| Öğe | Desktop |
|---|---|
| Header | **56px** fixed |
| Hero min-height | 640px (header dahil full-bleed) |
| Bölüm padding | 112px (anasayfa), 80px (stats) |
| PageHero default | pt 128 / pb 64, min 40dvh |
| PageHero compact | pt 112 / pb 48, min 30dvh |
| Bölüm başlığı → grid | 80px |
| Kart iç padding | 20px |
| Form satır gap | 20px |
| Girdi yüksekliği | **48px** |
| Buton yüksekliği | **44px** (primary CTA), ikon buton **40×40** |
| Back-to-top | 44×44, sağ/alt 24 |

### 4.4 Radius (teknik skala)

| Token | px | Nerede |
|---|---|---|
| `radius/control` | **2** | buton, input, pill, badge |
| `radius/card` | **4** | kart, görsel, 3D panel |
| `radius/overlay` | **8** | modal, dropdown, lightbox chrome |

Hiçbir yerde 12/16/24 “soft SaaS” radius yok.

---

## 5. Motion & UX

Süreler (mevcut CSS): fast 150 / base 300 / slow 500. Ease: `cubic-bezier(0.32, 0.72, 0, 1)`.

| An | Davranış |
|---|---|
| Sayfa yükleme | Header sabit; hero H1 kelime maskeli reveal (stagger 40ms). Reduced-motion: anında. |
| Scroll > 8px | Header opak + alt hairline |
| Kart hover | 1px `orange` border, başlık `accent-ink`. Lift **yok**. |
| Buton hover | ok 2px sağa. Magnetic yalnız Teklif Al. |
| Hero autoplay | 5s, hover’da durur. Reduced-motion: kapalı. |
| İstatistik | viewport’ta 0→hedef, 800ms. Reduced-motion: hedef değer. |
| 3D panel | sürükle-döndür. Reduced-motion: statik poster. |
| Route | üstte 2px `orange` progress. |

**Durum dili (her veri yüzeyi):** skeleton → boş → dolu; formlarda + gönderiliyor / başarı / hata.

Skeleton: `paper-band` dikdörtgenler, % pulse; başlık %75, satır %100/%85/%65.

---

## 6. Bileşen dili

### 6.1 Buton

| Varyant | Fill | Stroke | Metin |
|---|---|---|---|
| Primary | `orange` | yok | `ink-on-brand` |
| Outline | yok | hairline | `ink` |
| Ghost | yok | yok | `ink` |
| Icon | yok | hairline | 40×40 |

Disabled: opacity 0.4, pointer-events none. Loading: 16px spinner, label “Gönderiliyor…”.

### 6.2 TechLabel

`[fiducial]  01 / HİZMETLER` — Geist Mono 11, uppercase, tracking 0.14em, renk `muted` (hero’da `orange`).

### 6.3 Kart iskeleti (tek component)

```
[görsel — aspect varyantı]
[hairline]
[padding 20]
  TechLabel? → H3 (2 satır clamp) → Body/Small (2–3 satır) → Meta/Mono satırı
```

Aspect varyantları: `1:1` hizmet · `4:3` portfolyo · `16:9` haber · `16:10` video.

### 6.4 Form

Label üstte, Barlow Medium 14. Placeholder `muted`. Error: stroke `danger` + Body/Small mesaj. Focus: `focus` ring.

### 6.5 Overlay

Modal max 640px, radius 8, kart zemin, 1px hairline. Backdrop grafit %60. Esc kapatır.

---

## 7. Public sayfalar — desktop UX

Öncelik sırası: Home → Services → Portfolio → News → Contact → Videos → Account/Auth → System.

### 7.1 Anasayfa (8 bölüm, sıra sabit)

1. **Hero** — koyu, 1fr + 420px. H1 “Mühendislikte Sınırsız Hassasiyet”. Spec bandı. CTA: Projeleri İncele / İletişime Geç. Sağda 1:1 3D panel.
2. **Yetkinlik marquee** — 48px, Geist Mono, 9 etiket.
3. **Hizmetler** — `01 / HİZMETLER` + “Sunduğumuz Çözümler”. 4 kolon × 6 kart.
4. **Süreç** — 4 eşit kolon: Tara → Modelle → Doğrula → Üret. Arada yatay datum.
5. **Portfolyo** — 4 kolon × 8 kart, outline “Tüm Projeler →”.
6. **İstatistik** — 4 metrik: 8+ / 150+ / ±0.05 mm / 20 µm.
7. **Haberler** — 3 kart 16:9.
8. **CTA** — koyu, tek primary “İletişime Geç →”.

### 7.2 Hizmetler

PageHero index 01. Sol 280px sticky nav (10–15 hizmet) + sağ detay (16:9 görsel, özellik listesi, Teklif Al). Meta şeridi yok.

### 7.3 Portfolyo listesi + detay

Masonry 8/4/4/8/6/6. Filtre: tek seçim pill + arama + sıralama. Detay: 8 kolon medya + 4 kolon sticky spec tablosu.

### 7.4 Haber listesi + detay

İlk sayfada 21:9 öne çıkan kart. Grid 7/5 asimetrik. Detay: 3px okuma bar, 768px gövde.

### 7.5 İletişim

7/12 form kartı + 5/12 bilgi. Harita 384px.

### 7.6 Videolar / Hesap / Auth / Sistem

Yapı `FIGMA-PUBLIC-CONTEXT.md` §5.8–5.14. Görsel dil bu belgedeki token’lar. 404: büyük tabular “404” Geist Mono + 2 CTA.

### 7.7 Hakkımızda (yeni)

PageHero + 2 kolon: stüdyo metni (max 65ch) + spec tablosu (tolerans, tarama, formatlar, diller TR/ES). Sitemap ve 404 linkini karşılar.

---

## 8. İçerik sesi

- TR varsayılan, ES eşdeğer uzunlukta düşünülür (İspanyolca ~15% uzun).
- Başlıklar iddia eder (“Sınırsız Hassasiyet”), gövde ölçer (“±0.05 mm”).
- CTA fiil: İncele, Geç, Al, Gönder — “Keşfet yolculuğu” yok.
- Sayılar her zaman birimle: `20 µm`, `±0.05 mm`.

---

## 9. Figma dosya kısıtı (Starter)

En fazla **3 sayfa**, Dark mode değişkeni yok, MCP kota sınırlı.

| Sayfa | İçerik |
|---|---|
| Cover | Brand cover + type/color specimen (Foundations) |
| 01 Homepage | Desktop 1440 anasayfa |
| 02 Components | Button + kart + TechLabel |

Diğer public sayfalar bu belgedeki spec ile sonraki turda (Professional veya kota yenilenince) basılır.

---

## 10. Kod eşlemesi

| Figma | CSS |
|---|---|
| Barlow / Geist Mono | `--font-barlow` / `--font-geist-mono` |
| `orange` | `--primary: 16 95% 59%` |
| `paper` | `--background` |
| `radius/control` | `--radius-button` / `--radius-input` |
| container 1280 | `container-boxed` (`max-w-7xl`) |
| section 112 | anasayfa `py-80 md:py-112` (mevcut; `section` utility 96–160 — public anasayfa kendi padding’ini kullanır) |
