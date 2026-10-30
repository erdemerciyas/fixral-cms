# Fixral — Figma Prompt Seti (her blok < 2000 karakter)

Kullanım: **Blok 00'ı her seferinde başa yapıştırın**, ardından tasarlamak istediğiniz sayfanın bloğunu ekleyin.
Tam referans için `FIGMA-PUBLIC-CONTEXT.md` dosyasına bakın.

---

## Blok 00 — Master Brief (her prompt'un başına)

```
FIXRAL — public web sitesi. Endüstriyel mühendislik: 3D tarama, tersine mühendislik, CAD modelleme, 3D baski (FDM/SLA/SLS), prototipleme. Anlati dili: olcum, tolerans, dogrulanabilirlik (precision engineering).

DILLER: TR (varsayilan) + ES. Tum URL'ler /{lang}/... Haber segmenti dile gore degisir: /tr/haberler, /es/noticias.

LAYOUT
- Container 1280px maks, yatay padding 16/24/32px (mobil/sm/lg), ortalanmis
- Breakpoint: sm 640, md 768, lg 1024. Ana kirilimlar md ve lg.
- Frame genislikleri: 390 / 768 / 1440
- Header sabit, yukseklik 56px. Anasayfa tepesinde saydam, scroll >8px'te opak + alt hairline.
- Bolum dikey padding: 80px, md'de 112px. Bolumler arasi 1px hairline ayrac.

YAPISAL IMZA (her sayfada tekrar eder)
1. Monospace numarali teknik etiket: "03 / HIZMETLER" — kucuk, buyuk harf, genis harf araligi, basinda crosshair (+) veya tick isareti
2. Hairline olcu cetveli (ruler) — ince cizgi + duzenli tick'ler, bolum ayraci ve dekoratif imza
3. Blueprint izgara katmani — hero ve CTA zeminlerinde soluk teknik grid

KART ISKELETI (tum grid'lerde ayni, sadece aspect ve badge degisir)
Gorsel blogu (degisken aspect) + opsiyonel sol ust badge → hairline ayrac → metin blogu (padding 16-20px): opsiyonel numarali etiket / baslik (2 satir kirpma) / opsiyonel aciklama (2-3 satir kirpma) / monospace meta satiri (etiket solda, deger sagda).
Hover: kenarlik vurgusu + baslik renk degisimi.

DURUMLAR: her veri yuzeyi icin zorunlu 3 durum — yukleniyor (skeleton), bos (ikon + mesaj + CTA), dolu. Formlarda ek olarak: gonderiliyor, basarili, hata.

ERISILEBILIRLIK: tum interaktif ogelerde belirgin focus ring + offset. Skip link (focus'ta gorunur). prefers-reduced-motion tum animasyonlari kapatir.
```

---

## Blok 01 — Global Kabuk (Header + Footer)

```
HEADER (sabit, 56px, tum sayfalarda)
Soldan saga: logo gorseli (36x36 kare, opsiyonel) + logoText (opsiyonel) | arama tetikleyici (yalniz lg+: ikon + "Ne ariyorsunuz?" + "Ctrl K" kbd etiketi; hover/focus'ta 192px→256px genisler) | ana nav (yalniz lg+) | dil degistirici (lg+) | tema toggle | mobil arama ikonu (<lg) | "Teklif Al" birincil CTA butonu (lg+, ucak ikonlu) | hamburger (<lg)

NAV: linkler CMS'ten dinamik gelir — 2-8 adet, etiket uzunlugu degisken. Her linkin basinda sifir dolgulu index (01, 02, 03...). Aktif link alt kenarlikla isaretli. Varsayilan set: Anasayfa, Haberler, Hizmetler, Portfoy, Videolar, Iletisim.

HEADER DURUMLARI: (a) anasayfa tepesi — saydam, kenarliksiz, koyu zemin uzerinde acik metin (b) scroll sonrasi — opak zemin + alt hairline (c) alt sayfalar — her zaman opak.

Header'dan once "Ana icerige atla" skip link (sadece focus'ta gorunur).

FOOTER (koyu zemin, tum sayfalarda)
Ust hairline olcu cetveli bandi. Ana grid: 1 kolon → 2 (md) → 4 (lg), gap 32px.
Kolon 1: logo (40x40) + site adi + aciklama metni (maks 320px genislik) + sosyal ikon satiri (0-6 ikon: LinkedIn, Twitter, Instagram, Facebook, GitHub, YouTube — yalniz dolu olanlar)
Kolon 2: "HIZLI BAGLANTILAR" baslik (monospace, kucuk, buyuk harf) + link listesi
Kolon 3: "HIZMETLER" baslik + link listesi
Kolon 4: "ILETISIM" baslik + e-posta (zarf ikonu) + telefon (telefon ikonu) + adres (konum ikonu)

Alt bant (ust kenarlikla ayrilmis): sol tarafta monospace "© 2026 FIXRAL. Tum Haklari Saklidir." + surum etiketi + "Gelistiren {isim}" (altcizgili link).

BACK-TO-TOP: scroll >300px'te sag altta sabit 44x44 buton (yukari ok), 24px kenar bosluk.
```

---

## Blok 02 — Anasayfa (8 bölüm)

```
ANASAYFA — 8 bolum, sirasi sabit.

1) HERO — full-bleed, koyu, carousel. min-yukseklik 560px (mobil) / 640px (lg). Grid: 1fr + 420px (yalniz lg+), gap 64px.
Arka plan katmanlari: slide gorseli (object-cover) → soldan saga koyu scrim gradyani → blueprint izgara (coarse) → icerik.
SOL KOLON (maks 672px): monospace eyebrow etiketi (crosshair isaretli, "ENDUSTRIYEL COZUMLER") / cok buyuk H1 ("Muhendislikte Sinirsiz Hassasiyet", 1-3 satir) / aciklama paragrafi (maks 58 karakter genisligi) / SPEC BANDI: ust-alt hairline arasinda 3 monospace oge dikey ayracli — "TOLERANS ±0.05 MM" | "TARAMA 20 µM" | "STL / STEP / OBJ" / CTA cifti: birincil dolu buton ok ikonlu ("Projeleri Incele") + ikincil outline ("Iletisime Gec")
SAG KOLON (yalniz lg+): 3D model onizleme paneli, aspect 1:1, ince blueprint izgara, koselerde + crosshair isaretleri, alt bantta monospace "CANLI 3D ONIZLEME" + "Dondurmek icin surukleyin"
CAROUSEL KONTROLLERI: sol/sag 40x40 ok butonlari (dikeyde ortali, kenardan 12/20px) + altta ortali dot gostergesi (aktif olan 32x6px cubuk, pasifler 8x6px)

2) YETKINLIK SERIDI — tam genislik, kesintisiz kayan marquee, ayirici bandi. 9 monospace etiket: 3D Tarama · Tersine Muhendislik · FDM · SLA · SLS · CMM · CAD Modelleme · Prototipleme · Kalite Kontrol. Araya ayrac isareti.

3) HIZMETLER GRID — bolum basligi: monospace eyebrow "01 / HIZMETLER" (crosshair) + buyuk H2 "Sundugumuz Cozumler", maks 768px, alt bosluk 64/80px.
Grid: 2 kolon → 3 (md) → 4 (lg), gap 16px, 6 kart.
Kart: gorsel aspect 1:1 (yoksa blueprint zemin + ortada 64x64 ikon kutusu) → hairline → metin blogu: numarali etiket ("01 / HIZMETLER") / baslik / aciklama (2 satir) / hover'da acilan monospace spec satiri / saga hizali "DETAY →"
```

---

## Blok 03 — Anasayfa devamı (bölüm 4-8)

```
ANASAYFA bolum 4-8 (bolum 1-3 icin ayri prompt).

4) SUREC AKISI — hafif farkli zemin. Bolum basligi: eyebrow "02 / SUREC" + H2 "Taramadan Uretime" + alt metin "Her proje dort dogrulanabilir adimda ilerler."
Layout: mobilde dikey, md+ yatayda 4 esit kolon, gap 16px.
Adim karti: ust satirda numarali monospace etiket ("01 / SUREC") + sag kosede ince cizgili ikon / baslik / aciklama.
Adimlar: 1 Tara (tarama ikonu) — "Parca geometrisi yuksek cozunurluklu 3D tarama ile dijitallestirilir." 2 Modelle (kutu) — "Tarama verisi uretime hazir parametrik CAD modele donusturulur." 3 Dogrula (onay) — "Model, olcum raporlariyla orijinal parcaya karsi dogrulanir." 4 Uret (fabrika) — "Dogrulanan model FDM, SLA veya SLS ile uretime alinir."
Adimlar arasi baglayici olcu cetveli: masaustunde 40px yatay, mobilde 32px dikey. Son adimdan sonra yok.

5) PORTFOLYO VITRINI — eyebrow "03 / PORTFOLYO" + H2 "One Cikan Projeler".
Grid: 2 → 3 (md) → 4 (lg), gap 16px, 8 kart.
Kart: kapak gorseli aspect 4:3, hover'da tarama cizgisi (scan-line) overlay, sol ustte "ONE CIKAN" etiketi (kosullu) → hairline → baslik (2 satir) + monospace meta tablosu (etiket solda, deger sagda): YONTEM / MUSTERI / YIL.
Bolum CTA'si: outline buton "Tum Projeler →", ust bosluk 40/56px.

6) ISTATISTIK BANDI — farkli zemin, ust-alt hairline. Ustte "RAKAMLARLA" etiketli olcu cetveli.
Grid: 2 kolon → 4 (md), gap 24/40px → 48px.
4 metrik, her biri: cok buyuk sayi + vurgulu son ek + altinda monospace etiket.
"8+" Yil Deneyim | "150+" Tamamlanan Proje | "±0.05 mm" Uretim Toleransi | "20 µm" Tarama Cozunurlugu
Gorunum alanina girince sayilar sifirdan artar.

7) HABER GRID — eyebrow "04 / HABERLER" + H2 "Son Gelismeler".
Grid: 1 → 2 (sm) → 3 (lg), gap 24px, tam 3 kart.
Kart: gorsel aspect 16:9 → hairline → metin (padding 16/20px): baslik (2 satir) / ozet (2 satir) / alt monospace meta: solda tarih, sagda ilk etiket (dikey ayracli).
Bolum CTA'si: outline "Tum Haberler →"

8) TAM GENISLIK CTA — koyu zemin + blueprint izgara. Ortalanmis: eyebrow "PROJE TALEBI" (crosshair) + buyuk H2 "Projenizi Hayata Gecirelim" + alt metin + tek dolu CTA "Iletisime Gec →"
```

---

## Blok 04 — Paylaşılan Sayfa Hero'su (PageHero)

```
PAGEHERO — anasayfa disindaki 6 sayfanin ustunde kullanilan paylasilan hero bileseni. Tek component, iki varyant.

YAPI (yukaridan asagi, hepsi kosullu):
1. Breadcrumb satiri (ev ikonu › bolum › sayfa; son oge link degil) — alt bosluk 24px
2. Monospace teknik etiket satiri: sifir dolgulu index ("03") + badge metni, tick isaretli — alt bosluk 20px
3. Cok buyuk H1 baslik (kelime kelime maskeli reveal animasyonu) — alt bosluk 20px
4. Alt baslik (vurgulu, orta-buyuk punto) — kosullu
5. Aciklama paragrafi (maks 65 karakter genisligi, ikincil renk) — alt bosluk 32px
6. "One cikan" mikro etiketi: kucuk kutu icinde nokta isareti + monospace metin — kosullu
7. CTA cifti: birincil dolu buton (ok ikonlu) + ikincil outline buton — kosullu
8. Alt hairline olcu cetveli (dekoratif) — ust bosluk 40px

Arka plan: duz ikincil zemin + soluk blueprint izgara bandi. Alt kenarda hairline.
Icerik sola hizali, container icinde.

VARYANT A "default": min-yukseklik 40dvh, padding ust 112px alt 56px (md: 128/64), H1 buyuk
VARYANT B "compact": min-yukseklik 30dvh, padding ust 96px alt 40px (md: 112/48), H1 bir kademe kucuk

SAYFA BASINA KULLANIM:
Hizmetler — index 1, badge "HIZMETLER", default, CTA "Hizmetleri Incele"
Portfolyo — index 2, badge yok, default, CTA "Projeleri Incele"
Proje detayi — index 2, compact, CTA yok, "One Cikan Proje" mikro etiketi olabilir
Haber listesi — index 3, badge yok, default, CTA YOK
Videolar — index 4, badge yok, default, CTA "Videolari Kesfet"
Iletisim — index 5, badge yok, default, CTA "Iletisim Formu"

Tumunde breadcrumb acik.
```

---

## Blok 05 — Hizmetler Sayfası

```
HIZMETLER SAYFASI — 3 bolum.

1) PAGEHERO (ayri prompt'ta tanimli): index 1, badge "HIZMETLER", baslik "Sundugumuz Hizmetler", CTA "Hizmetleri Incele".

2) HIZMET GEZGINI
Bolum girisi (maks 672px, alt bosluk 40/56px): monospace eyebrow "HIZMETLER" (crosshair) + H2 "Detayli Hizmet Aciklamalari" + alt metin "Her bir hizmetimizin detaylarini inceleyin ve ihtiyaclariniza en uygun cozumu kesfedin." + olcu cetveli.

Layout: 1 kolon (mobil) → [280px | 1fr] (lg), gap 32/48px.

SOL — yapiskan sidebar navigasyonu (lg'de sticky, ust 112px, tasarsa scroll):
10-15 hizmet ogesi, dikey liste, gap 8px. Her oge: sifir dolgulu monospace numara ("01", genislik 24px, soluk) + hizmet basligi (1-2 satir sarabilir).
Aktif oge: dolu vurgu zemini. Pasif: hairline kenarlikli yuzey, hover'da vurgu.
lg ALTINDA: yatay kaydirilabilir pill satiri (scrollbar gizli).

SAG — detay paneli (secili hizmet):
a) Monospace teknik etiket: "01 / HIZMET ADI" (tick isaretli)
b) Buyuk H2 hizmet basligi
c) Gorsel aspect 16:9, hairline kenarlikli — gorsel yoksa hizmet basliginin ILK HARFI dev tipografi olarak soluk placeholder
d) Aciklama paragrafi (duz metin, rahat satir yuksekligi)
e) Ozellik listesi: her satir check ikonu (vurgu rengi) + metin, gap 12px, 0-10 oge, sirayla animasyonlu giris
f) Meta seridi (ust-alt hairline arasi, monospace, kosullu — cogu zaman BOS): saat ikonu + sure | yildiz + "4.8/5" | fiyat
g) CTA: dolu buton "Teklif Al →"
Bolumler arasi bosluk 32px.

DURUMLAR: yukleniyor (sidebar 4 cubuk skeleton + detay skeleton) / hata (uyari ikonu + "Bir hata olustu" + "Tekrar Dene" butonu) / bos (ikon + "Henuz hizmet bulunmuyor" + alt metin) / dolu

3) CTA BANDI — vurgu zemini, ortalanmis, dekoratif geometrik cizgiler. eyebrow "OZEL PROJE" (tick) + buyuk H2 "Ozel Bir Projeniz mi Var?" + alt metin (maks 576px) + iki CTA: dolu "Proje Teklifi Al" (kivilcim ikonlu) + outline "Ornek Projelerimizi Inceleyin →"
```

---

## Blok 06 — Portfolyo Listesi

```
PORTFOLYO LISTESI — 3 bolum.

1) PAGEHERO: index 2, baslik "Portfolyo", aciklama "Tamamladigimiz basarili projeler ve yaratici cozumler", CTA "Projeleri Incele".

2) PROJELER BOLUMU
Bolum basligi: eyebrow "01 / PROJELER" (crosshair) + H2 "Calisma Galerisi" + alt metin (maks 576px).

FILTRE SISTEMI (3 katman):
a) Kategori pill bari — "Tumunu Goster" + her kategori icin pill (5-10 adet). Aktif olanda kayan dolu gosterge. TEK SECIM.
b) Kontrol satiri (mobil dikey, md+ yatay, gap 12px): arama girdisi (solda buyutec ikonu, sagda temizle X — yalniz deger varken, yukseklik 48px, esner) | siralama select (solda siralama ikonu, sagda ok; secenekler: En Yeni, En Eski, A-Z, Z-A, Kategoriye Gore) | "Filtreler" toggle butonu (huni ikonu + aktif filtre sayisi badge'i)
c) Genisletilebilir gelismis panel (ust hairline ile ayrilmis, 1 → 3 kolon md): KATEGORILER (checkbox listesi, COKLU secim, maks 192px scroll) | TEKNOLOJILER (checkbox listesi, monospace etiketler, maks 192px scroll) | TARIH ARALIGI (Baslangic + Bitis date girdileri)
d) Sonuc satiri (ust hairline): monospace "12 PROJE BULUNDU" solda + "Filtreleri Temizle" sagda (kosullu)

MASONRY GRID: 1 kolon (mobil) → 12 kolon (md), gap 16/20px. 6'lik tekrarli desen:
kart 1: 8/12 genislik, gorsel aspect 16:9
kart 2: 4/12, aspect 4:5
kart 3: 4/12, aspect 4:5
kart 4: 8/12, aspect 16:9
kart 5: 6/12, aspect 4:3
kart 6: 6/12, aspect 4:3
(sonra tekrar)

PROJE KARTI: kapak gorseli + sol ustte badge'ler ("ONE CIKAN" ve/veya kup ikonlu "3D") | HOVER OVERLAY: baslik + maks 3 teknoloji etiketi + "+N" tasma | gorsel alti metin: baslik / aciklama (2 satir) / monospace meta (MUSTERI / TARIH)
Gorsel durumlari: yukleniyor pulse / yuklendi / hata (kirik gorsel ikonu)

DURUMLAR: yukleniyor (6 kartlik masonry skeleton) / filtre sonucu bos (buyuk arama ikonu + "Arama Sonucu Bulunamadi" + aciklama + "Filtreleri Temizle") / hic proje yok (ayni desende bos durum) / dolu

3) CTA BANDI — vurgu zemini, ortalanmis: eyebrow "BIRLIKTE CALISALIM" + H2 "Projenizi Birlikte Gerceklestirelim" + alt metin + iki CTA ("Proje Baslatalim", "Hizmetlerimizi Inceleyin →")
```

---

## Blok 07 — Proje Detayı

```
PROJE DETAYI SAYFASI.

1) PAGEHERO — COMPACT varyant: baslik = proje adi, buton yok, breadcrumb acik, kosullu "ONE CIKAN PROJE" mikro etiketi, index 2.

2) ICERIK GRID: 1 kolon → 12 kolon (lg), gap 32/48px. Bolum padding 40/56px.

SOL KOLON (8/12), bolumler arasi bosluk 48px:

a) MEDYA GALERISI (kart icinde, hairline kenarlikli)
Gorseller ve 3D modeller TEK akista birlesik (sekme yok).
- Ana gosterim: aspect 16:10, tam kaplama. Gorselde hover'da buyutec ikonu. 3D'de gomulu viewer + kosede format badge'i (STL/GLB) + indir ikonu.
- Thumbnail grid (1'den fazla oge varsa): ust satirda "Proje Medyalari" + toplam sayi badge'i + "3 3D" badge'i. Thumbnail'lar 2 → 6 kolon, kare, uzerinde tip ikonu + index numarasi, secili olanda kalin kenarlik.

b) PROJE DETAYLARI — H2 "Proje Detaylari" + olcu cetveli, ardindan kart icinde ZENGIN METIN (padding 24/32/40px). Tipografi hiyerarsisi tanimlanmali: h2/h3/h4, paragraf, madde ve sirali liste, link, kalin, alinti (sol kenarlikli), inline kod, gomulu gorsel.

c) 3D MODELLER (kosullu) — kart icinde H3 "3D Modeller" + olcu cetveli + dosya listesi. Her satir: format badge'i (STL/OBJ/GLTF/GLB) + dosya adi.

SAG KOLON (4/12, lg'de sticky ust 96px), gap 24px:

a) PROJE BILGILERI karti (padding 24/32px): H3 "Proje Bilgileri" + olcu cetveli + monospace spec tablosu (satirlar hairline ile ayrilmis, etiket solda kucuk buyuk-harf monospace, deger sagda):
MUSTERI / TARIH / KATEGORI / DURUM (her zaman check ikonlu basari etiketi "TAMAMLANDI") / KULLANILAN TEKNOLOJILER (alt satirda etiket bulutu, monospace, sarma)

b) CTA karti (vurgu kenarlikli, ortalanmis): H4 "Benzer Bir Projeniz mi Var?" + aciklama + TAM GENISLIK dolu buton "Teklif Alin"

3) BENZER PROJELER (kosullu) — ust hairline ayrac, ust bosluk 80/112px. Bolum basligi "Benzer Projeler" + alt metin. Standart proje kart grid'i. Altta ortalanmis outline buton "Tum Portfoyu Goruntule".

LIGHTBOX (tam ekran overlay): kapat butonu (sag ust) + onceki/sonraki ok butonlari + monospace sayac "01 / 12" + gorsel object-contain + alt bantta baslik + tip + format + dosya boyutu. Zemin tiklamasi kapatir.
```

---

## Blok 08 — Haber Listesi

```
HABER LISTESI SAYFASI (/tr/haberler, /es/noticias). Sayfa basina 12 kayit.

1) PAGEHERO: index 3, baslik "Haberler & Duyurular", aciklama "En son haberler, sirket duyurulari ve sektor guncellemelerini buradan takip edebilirsiniz.", BUTON YOK, breadcrumb acik.

2) FILTRE CUBUGU — kart icinde (hairline kenarlik, padding 16/20px), mobil dikey / md+ yatay iki uca yayilmis, gap 16px.
Sol: arama formu (md+'de 320px genislik, solda buyutec ikonu, placeholder "Haberlerde ara...", yukseklik 40px)
Sag: etiket pill'leri (sarmali) — "Tumu" + her etiket icin pill (5-15 adet). Aktif olan dolu, pasifler notr yuzey.

3) SONUC BILGISI (yalniz arama/etiket aktifken) — kucuk nokta isareti + "\"3D tarama\" icin" / "\"CMM\" etiketinde" + vurgulu "8 sonuc bulundu"

4) ONE CIKAN HERO KARTI — yalniz 1. sayfada, arama ve etiket yokken.
Tam genislik, gorsel aspect 21:9 (mobil) / 2.4:1 (md+). Gorsel uzerine cift gradyan (alttan + soldan). Hover'da gorsel hafif zoom.
Sol altta icerik blogu (padding 24/40/56px, maks 672px, gap 16px): monospace etiket (tick isaretli) + tarih | cok buyuk H2 baslik (2 satir kirpma) | ozet (2 satir kirpma, maks 576px) | "Devamini Oku →"

5) ASIMETRIK KART GRID: 1 kolon → 12 kolon (md), gap 24/28px.
Desen: her 3. kart (index 0, 3, 6...) 7/12 genislik "large" varyant, gorsel aspect 4:3, padding 28px, baslik bir kademe buyuk. Digerleri 5/12 genislik, gorsel aspect 16:10, padding 20/24px.
KART: gorsel (hover'da zoom 1.04 + gradyan) → metin: monospace etiket (tick) + tarih satiri / baslik (2 satir kirpma) / ozet (3 satir kirpma) / alt satirda "Devamini Oku →"
Hover: kenarlik vurgusu + kart hafif yukari kalkma.

6) SAYFALAMA (kosullu, ortalanmis, gap 8px, ust bosluk 16px): "Onceki" pill (kosullu) + sayfa numaralari (40x40 kare, monospace, tabular sayilar) + "Sonraki" pill (kosullu). Aktif sayfa dolu. Cok sayfada ellipsis (...) deseni ekle.

DURUM — SONUC YOK: kesikli kenarlikli blok (ortalanmis, padding 80px): 56x56 kutu icinde gazete ikonu + H3 "Sonuc Bulunamadi" + "Aradiginiz kriterlere uygun haber bulunamadi." + dolu CTA "Tum Haberleri Goster"

HATA DURUMU: ikon + "Bir hata olustu" + "Tekrar Dene" butonu.
```

---

## Blok 09 — Haber Detayı

```
HABER DETAYI SAYFASI.

KALICI: sayfanin en ustunde sabit OKUMA PROGRESS BAR'i — 3px yukseklik, scroll ilerlemesine gore soldan saga dolar, vurgu rengi.

1) HERO — gorselsiz, duz ikincil zemin, alt hairline. Padding: ust 128px (md 160px), alt 48px (md 64px). Icerik maks 768px, sola hizali, gap 20px.
a) Etiket satiri: TUM etiketler monospace teknik etiket olarak (tick isaretli), sarmali, 0-5 adet
b) Cok buyuk H1 baslik (1-3 satir, siki harf araligi)
c) Ozet paragrafi (kosullu, orta-buyuk punto, ikincil renk, maks 672px)
d) Meta satiri (gap 20px): takvim ikonu + monospace uzun format tarih | kullanici ikonu + yazar adi (kosullu)

2) BREADCRUMB — kendi basina ince bant, ust padding 24px.

3) MAKALE GOVDESI (padding 48/64px)
a) One cikan gorsel aspect 16:9, tam genislik, hairline kenarlikli, alt bosluk 40px (kosullu)
b) ZENGIN METIN govdesi — tanimlanmasi gereken elemanlar: h2/h3/h4, paragraf (satir yuksekligi 1.8), link, kalin, madde ve sirali liste, alinti (sol kenarlikli, italik), inline kod (monospace, zeminli), kod blogu (kutulu), tablo, gomulu gorsel
c) ETIKET BLOGU (kosullu) — ust hairline + etiket ikonu + monospace "KONULAR" + "#etiket" pill'leri (monospace, tiklanabilir)
d) PAYLASIM BLOGU — ust hairline + paylas ikonu + monospace "BU HABERI PAYLAS" + 3 kare 40x40 ikon butonu (Twitter, Facebook, LinkedIn), hover'da dolu vurgu
e) GERI LINKI — "← Tum Haberlere Don" (hover'da ok sola kayar)

4) ILGILI PROJELER (kosullu) — baslik + yaninda uzayan hairline cizgi. Grid 1 → 2 (md), gap 20px. Kart: 208px yukseklikte gorsel + uzerine alttan gradyan + sol altta proje basligi (1 satir).

5) ILGINIZI CEKEBILIR (kosullu) — baslik + hairline. YATAY KAYDIRMALI kart seridi (snap davranisli, scrollbar gizli), gap 20px. Kart genisligi 280px (mobil) / 320px (md+): gorsel aspect 16:10 + padding 16px metin: baslik (2 satir kirpma) + "Okumaya basla →"

ES lokali metinleri: "Temas", "Compartir esta noticia", "Volver a todas las noticias", "Proyectos Relacionados", "Te puede interesar", "Leer mas".
```

---

## Blok 10 — İletişim Sayfası

```
ILETISIM SAYFASI — 3 bolum.

1) PAGEHERO: index 5, baslik "Bizimle Iletisime Gecin", aciklama "Sorulariniz ve onerileriniz icin bize ulasin", CTA "Iletisim Formu", breadcrumb acik.

2) FORM + BILGI BOLUMU (padding 64/96px)
Bolum ustunde asagi dogru sonen blueprint izgara bandi.
Bolum girisi (alt bosluk 48/64px): eyebrow "01 / ILETISIM" (crosshair) + H2 "Size nasil yardimci olabiliriz?" + alt metin (maks 576px) "Proje teklifleriniz, sorulariniz veya is birligi onerileriniz icin formu doldurun. En kisa surede donus yapacagiz."

Layout: 1 kolon → 12 kolon (lg), gap 40/56px, ustten hizali.

SOL (7/12) — FORM KARTI (hairline kenarlik, padding 32/40px, alan araliklari 20px):
- 2 kolonlu satir (sm+): "Adiniz Soyadiniz" (zorunlu, placeholder "Orn: Ali Veli") + "E-posta Adresiniz" (zorunlu, placeholder "iletisim@example.com")
- "Konu" (zorunlu, tam genislik, placeholder "Proje Teklifi")
- "Mesajiniz" (zorunlu, textarea 5 satir, resize kapali, placeholder "Merhaba, ...")
Girdi yuksekligi 48px, etiketler ustte kucuk kalin. Submit: TAM GENISLIK 48px dolu buton "Mesaji Gonder →"
FORM DURUMLARI: bosta / gonderiliyor (spinner + "Gonderiliyor...", devre disi) / basarili (check ikonlu basari banner'i) / hata (uyari ikonlu hata banner'i)

SAG (5/12), gap 32px:
a) "Iletisim Bilgilerimiz" karti (padding 32px): H3 + 4 bilgi satiri (gap 20px), her biri 40x40 ikon kutusu + monospace kucuk buyuk-harf etiket + deger metni:
E-POSTA (zarf, mailto link) / TELEFON (telefon, tel link) / ADRES (konum) / CALISMA SAATLERI (saat, kosullu)
Yukleniyor: 4 satirlik skeleton (ikon karesi + 2 metin cubugu)
b) "Sosyal Medya" karti (kosullu): H3 + 40x40 kare ikon butonlari (LinkedIn, Twitter, Instagram, Facebook), hover'da vurgu

3) KONUM KARTI (ust bosluk 64/96px, padding 32px)
Ust satir: H3 "Konumumuz" solda + sagda konum ikonu + "Haritada goster" ipucu
a) Adres ozet bandi (farkli zemin, padding 16px, mobil dikey / sm+ yatay): 40x40 ikon kutusu + "Iletisim Bilgileri" + adres metni | sagda iki kucuk buton: outline "Buyuk Harita" + dolu "Yol Tarifi"
b) Harita alani: yukseklik 384px, koseleri yumusatilmis. Yuklenirken uzerinde spinner + "Harita yukleniyor..." katmani.
```

---

## Blok 11 — Videolar Sayfası

```
VIDEO GALERI SAYFASI. Sonsuz scroll (ilk 50, sonra 12'lik).

1) PAGEHERO: index 4, baslik "Videolar", CTA "Videolari Kesfet", breadcrumb acik.

2) FILTRE PANELI (kart icinde, hairline kenarlik):
a) Arama girdisi (solda buyutec, placeholder "Video ara...", yukseklik 48px)
b) Tip toggle pill'leri: "Tumu" | "Video" | "Kisa" — aktif olan dolu
c) Kanal select (kosullu): "Tum Kanallar" + "Fixral Tech (24)" formatinda secenekler
d) Etiket bolumu (kosullu): monospace "ETIKETLER" basligi + cok secilebilir pill'ler (sarmali, 5-20 adet)
e) "Temizle" butonu (kosullu)
f) Sonuc ozeti (ust hairline): monospace "18 VIDEO" solda + "Filtreleri Temizle" sagda

3) BENTO GRID: 12 kolon, gap 20px.
kart 1 (index 0): 12/12 → 8/12 (md), gorsel aspect 16:9, ACIKLAMA GOSTERILIR (2 satir)
kart 2 (index 1): 12/12 → 4/12 (md), aspect 16:10, ACIKLAMA GOSTERILIR (2 satir)
kart 3+ (index 2+): 12/12 → 4/12 (md), aspect 16:10, ACIKLAMA YOK

VIDEO KARTI: thumbnail (hover'da hafif zoom) + sag ustte tip badge'i (ikon + "Kisa" veya "Video") → metin blogu: baslik (2 satir kirpma) / aciklama (yalniz ilk 2 kartta, 2 satir) / etiket pill'leri (large kartta 4'e kadar, digerlerinde 2'ye kadar, + "+N" tasma) / alt satirda yayin tarihi (monospace) / hover'da gorunen "Izle →"
Tiklama yeni sekmede YouTube'a gider — site ici oynatici YOK.

DURUMLAR:
- yukleniyor: filtre paneli skeleton + 1 buyuk (8/12) + 7 kucuk (4/12) kart skeleton
- daha fazla yukleniyor: grid altinda 3 kart skeleton
- liste sonu: ortalanmis notr metin "Tum videolar yuklendi"
- bos (filtreli): ikon + "Video bulunamadi" + aciklama + "Filtreleri Temizle" CTA
- bos (hic video yok): ikon + "Video bulunamadi" + "Henuz hic video eklenmemis."
- HATA: ikon + "Videolar yuklenemedi" + "Tekrar Dene" butonu (su an eksik, tasarlanmali)
```

---

## Blok 12 — Overlay'ler ve Modallar

```
OVERLAY / MODAL SETI — 5 yuzey.

1) MOBIL MENU (tam ekran overlay, yalniz <lg)
a) Baslik satiri: logoText (veya "Menu") + kapat butonu
b) Arama formu (tam genislik, solda ikon)
c) Nav link listesi — buyuk dokunma alanlari, sirayla animasyonlu giris, aktif oge isaretli, her linkte ikon + etiket
d) Alt aksiyon blogu (ust hairline): oturum acikken kullanici karti (avatar bas harfi + ad + e-posta) + "Hesabim" linki | oturum kapaliyken "Giris Yap" linki | TAM GENISLIK dolu buton "Proje Basvurusu"

2) ARAMA MODALI (Ctrl+K ile acilir, ustten inen panel)
a) Arama girdisi (buyuk, solda ikon, placeholder "Site genelinde ara...") + sagda "ESC" ipucu + kapat
b) Sonuclar kategoriye gruplu: her grup basligi monospace badge ("HABERLER", "PORTFOY", "HIZMETLER") + ayrac + sonuc satirlari. Her satir: baslik + kisaltilmis aciklama + sag ok. Kategori basina 3 sonuc.
c) Alt bant: "Tum sonuclari gor: \"3D tarama\""
DURUMLAR: bos sorgu (hizli linkler: Haberler / Portfoy / Hizmetler) / yukleniyor (spinner) / sonuc listesi / sonuc yok ("... ile ilgili sonuc bulunamadi")

3) TEKLIF AL MODALI (header CTA'sindan acilir, tek adimli form, ortalanmis, maks 640px)
Baslik + kapat. Alanlar:
- Ad Soyad (zorunlu) + E-posta (zorunlu) — 2 kolon (sm+)
- Telefon (opsiyonel)
- Proje Turu select (zorunlu): 3D Tarama, Tersine Muhendislik, 3D Modelleme, CAD Tasarim, Prototip, Danismanlik, Diger
- Butce Araligi select: 5.000 TL alti, 5-15 bin, 15-50 bin, 50 bin uzeri, Goruselim
- Zaman Plani select: En kisa surede, 1 hafta, 1 ay, 3 ay, Esnek
- Proje Detaylari textarea (4 satir, zorunlu)
Alt aksiyon: outline "Iptal" + dolu "Basvuruyu Gonder"
DURUMLAR: bosta / gonderiliyor ("Gonderiliyor...", devre disi) / basarili (yesil banner "Proje basvurunuz basariyla gonderildi!") / hata (kirmizi banner)

4) DIL DEGISTIRICI DROPDOWN — tetikleyici: bayrak + dil kodu (TR/ES) + ok. Icerik: her dil icin bayrak + tam ad + aktif olanda check. 1 dil varsa hic gorunmez.

5) HESAP DROPDOWN (masaustu nav) — oturum acikken: kullanici bilgi basligi + "Admin Paneli" (kosullu) + "Hesabim" + "Cikis Yap". Oturum kapaliyken: "Giris Yap" + "Kayit Ol" butonlari.
```

---

## Blok 13 — Hesap + Kimlik Sayfaları

```
HESAP VE KIMLIK SAYFALARI.

A) HESABIM SAYFASI (oturum gerekli)
1) Karsilama bandi (koyu zemin): buyuk avatar (kullanici adinin bas harfi) + "Merhaba, Ali Veli" + "Hesap durumunuzu yonetin." | sagda istatistik karti: buyuk sayi + "MESAJ" etiketi
2) Layout: sidebar 3/12 (yapiskan) + icerik 9/12, gap 32px
SIDEBAR: 3 sekme butonu (dikey liste) — "Mesajlar" (okunmamis sayi badge'i ile), "Adresler", "Profil". Aktif sekme dolu. Alt ayrac + "Cikis Yap" (ayirt edici renk).

SEKME MESAJLAR: liste ogesi — checkbox + ikon (duyuru megafonu / sohbet balonu) + konu basligi + tarih + kosullu "DUYURU" badge'i + govde metni veya KONUSMA DIZISI (admin ve kullanici baloncuklari farkli hizalanmis + zaman damgasi).
Toplu aksiyon bari (secim varken, ust kisimda): "2 mesaj secildi" + "Secilenleri Sil".
Sayfalama: "Onceki" | "Sayfa 1 / 3" | "Sonraki".
Durumlar: yukleniyor (spinner) / bos ("Henuz mesajiniz yok") / dolu

SEKME ADRESLER: adres karti — baslik + ad soyad + adres + ilce/sehir + ulke + telefon + kosullu "VARSAYILAN" badge'i + aksiyon linkleri ("Varsayilan Yap", "Duzenle", "Sil"). Ustte veya altta "+ Yeni Adres Ekle" butonu.
Bos: "Kayitli adresiniz yok".
ADRES MODALI: baslik "Yeni Adres Ekle" / "Adresi Duzenle". Alanlar: Adres Basligi*, Ad Soyad*, Telefon*, Ulke (salt okunur "Turkiye"), Sehir*, Ilce*, Adres* (textarea), Posta Kodu, "Varsayilan adres" checkbox. Aksiyonlar: "Vazgec" + "Kaydet".

SEKME PROFIL: salt okunur alanlar (Ad Soyad, E-posta) + yardim metni | Sifre Degistir bolumu: Mevcut Sifre, Yeni Sifre, "Sifreyi Guncelle" butonu.

B) GIRIS SAYFASI — ortalanmis kart (maks 448px): baslik + alt metin. Alanlar: E-posta (placeholder "ornek@email.com"), Sifre (placeholder noktalar). Sag ustte veya altta "Sifremi Unuttum" linki. TAM GENISLIK dolu buton "Giris Yap" (yuklenirken "Giris Yapiliyor..."). Alt ayrac + "Hesabiniz yok mu? Kayit Ol". INLINE HATA ALANI ekle (su an sadece toast var).

C) KAYIT SAYFASI — ayni kart deseni. Alanlar: Ad Soyad, E-posta, Sifre (min 6), Sifreyi Onayla (min 6). Inline hata: "Sifreler eslesmiyor." TAM GENISLIK buton "Kayit Ol" (yuklenirken "Kayit Yapiliyor..."). Alt link "Zaten hesabiniz var mi? Giris Yap". BASARI EKRANI tasarla (su an tarayici alert'i kullaniliyor).
```

---

## Blok 14 — Sistem Sayfaları

```
SISTEM SAYFALARI — 5 yuzey.

1) 404 SAYFASI (ortalanmis, tam yukseklik)
Cok buyuk "404" gostergesi (dekoratif, blueprint izgara zemininde olabilir) + H1 "Sayfa Bulunamadi" + aciklama paragrafi (maks 512px) + 4 maddelik oneri listesi (kucuk, ikincil renk) + CTA cifti: dolu "Ana Sayfaya Don" + outline "Geri Don" + alt bolumde "POPULER SAYFALAR" monospace basligi altinda link listesi (Hizmetlerimiz, Portfolyo, Iletisim).

2) HATA SAYFASI (ortalanmis)
Uyari ikonu (buyuk) + H1 "Oops! Bir Hata Olustu" + aciklama + HATA DETAY KUTUSU (monospace, farkli zemin, hairline kenarlik — gelistirmede hata mesaji, uretimde genel metin + hata kodu) + CTA cifti: dolu "Sayfayi Yenile" + outline "Ana Sayfaya Don" + alt yardim bolumu: "Sorun devam ederse" + "Iletisime Gec" linki.

3) CEVRIMDISI SAYFASI (PWA)
Baglanti kesik ikonu + H1 "Cevrimdisisiniz" + durum satiri: nabiz atan nokta + "Internet baglantisi yok" + CTA cifti: dolu "Tekrar Dene" + outline "Geri Don" + bilgi kutusu (hairline kenarlik): "Onbellekteki Icerik Kullanilabilir" + aciklama + 4 maddelik baglanti ipucu listesi.
NOT: mevcut metinler Ingilizce, TR/ES olarak tasarlanmali.

4) GLOBAL LOADING SKELETON (route gecisi)
Header nav pill skeleton'lari + hero alani: 2-3 metin cubugu + 2 buton cubugu + 6 kartlik grid skeleton (gorsel blogu + 2 metin cubugu) + sag altta sabit spinner.
Ust kenarda ince route ilerleme cubugu (2-3px, vurgu rengi, soldan saga).

5) PORTFOLYO LOADING SKELETON
Hero skeleton (2 cubuk) + 4 filtre pill skeleton'i + 6 kartlik masonry skeleton (8/4/4/8/6/6 kolon deseninde, farkli aspect'lerle).

SKELETON DILI (tum sayfalarda tutarli): notr zeminli dikdortgenler, hafif nabiz animasyonu, gercek icerigin genisligini taklit eder (baslik %75, metin %100/%85/%65).

TOAST BILDIRIMLERI: sag ust veya alt kosede yigin. 3 varyant: basari (check ikonu), hata (uyari ikonu), bilgi. Kapat butonu.
```

---

## Blok 15 — Bileşen Varyant Seti (tek prompt)

```
BILESEN KUTUPHANESI — Fixral public site "precision kit". Varyant setleri olarak kur.

1) TECHLABEL — monospace teknik etiket. Kucuk punto, buyuk harf, genis harf araligi.
Varyantlar: marker = crosshair (+ isareti) | tick (kisa dikey cizgi) | none. Opsiyonel index (sifir dolgulu sayi: "01", "02"). Format: "[isaret] 03 / HIZMETLER"

2) MEASURERULE — olcu cetveli / hairline ayrac.
Varyantlar: ticks = sparse | normal | dense · orientation = horizontal | vertical · opsiyonel label + labelPosition = start | center | end

3) BLUEPRINTGRID — teknik izgara arka plan katmani.
Varyantlar: density = fine | normal | coarse · opacity = faint | subtle | strong · major = true/false (kalin ana cizgiler)

4) DATASTAT — sayac istatistik. Cok buyuk sayi + on ek (±) + son ek (mm, µm, +) + altinda monospace etiket. Ondalik destegi.

5) SECTIONHEADER — eyebrow (TechLabel) + buyuk H2 + opsiyonel alt metin (maks 65 karakter genisligi).
Varyantlar: align = left | center

6) EMPTYSTATE — ortalanmis: ikon (kutu icinde) + baslik + aciklama + opsiyonel CTA butonu. Kesikli kenarlik varyanti da olsun.

7) ERRORSTATE — uyari ikonu + baslik + mesaj + "Tekrar Dene" butonu.

8) SKELETON SETI — SkeletonText (satir sayisi 1-5), SkeletonCard (gorselli / gorselsiz), SkeletonGrid (2/3/4 kolon), SkeletonHero.

9) BUTONLAR — birincil dolu, ikincil outline, hayalet, ikon buton (40x40).
Her biri icin: default, hover, active, focus (ring + offset), loading (spinner), disabled.
Ok ikonlu varyantlar: hover'da ok saga 2px kayar.

10) FORM KONTROLLERI (yukseklik 48px) — metin girdisi, e-posta, sifre, textarea, select, checkbox, date, ikonlu arama girdisi (temizle butonlu).
Her biri: default, focus, filled, error (mesajli), disabled.

11) PILL / TOGGLE — filtre pill'i, etiket pill'i, tip toggle.
Durumlar: inactive, active (dolu), hover.

12) BADGE / ETIKET — "ONE CIKAN", "3D", "DUYURU", "VARSAYILAN", format badge'i (STL/GLB), tip badge'i (Kisa/Video), sayi badge'i.

13) BREADCRUMB — ev ikonu › ara segment › aktif sayfa (link degil). Maks 3 seviye.

14) PAGINATION — "Onceki" + numara kareleri (40x40, monospace) + ellipsis + "Sonraki". Aktif sayfa dolu.

15) FEEDBACK — basari banner'i (check), hata banner'i (uyari), toast (3 varyant).
```

---

## Karakter Sayıları

Aşağıdaki komutla doğrulayabilirsiniz:

```bash
node -e "const fs=require('fs');const t=fs.readFileSync('FIGMA-PROMPTS.md','utf8');const b=t.match(/```[\s\S]*?```/g)||[];b.forEach((x,i)=>console.log(i,x.replace(/```/g,'').trim().length))"
```
