/**
 * FIXRAL web içeriği (redesign 2026) — hizmet, disiplin, süreç, teslimat ve
 * yazılım kataloğu. Tasarımın yapısal verisi burada; kısa arayüz metinleri
 * `messages/tr.json` içindeki `fx.*` anahtarlarında.
 *
 * Hizmet görselleri ve uzun açıklamalar yönetim panelinden (ServiceRow) gelir:
 * katalogdaki `slug` ya da `dbSlugs` ile eşleşen aktif kayıt bulunursa kapak
 * görseli ve zengin metin hizmet detay sayfasında gösterilir.
 *
 * Yazılım bilgileri GitHub README'lerinden alınmıştır (Ekim 2026).
 */

export type FxLocale = 'tr'
type Localized<T> = Record<FxLocale, T>

// Site tek dilli (Türkçe); [lang] segmenti yalnızca URL yapısı için korunur
export const toFxLocale = (_lang?: string | null): FxLocale => 'tr'

/* ---------------------------------------------------------------- Disiplinler */

export type DisciplineId = 'muhendislik' | 'tasarim' | 'uretim'

export interface DisciplineDef {
  id: DisciplineId
  en: string
  services: ServiceKey[]
  text: Localized<{ name: string; body: string }>
}

/* ------------------------------------------------------------------ Hizmetler */

export type ServiceKey = 'tarama' | 'tersine' | 'otomotiv' | 'cad' | 'pcb' | 'gomulu' | 'baski' | 'cnc'
export type PartName = 'gear' | 'bracket' | 'pcb' | 'enclosure' | 'impeller' | 'vase'
export type VizMode = 'points' | 'wire' | 'dev' | 'solid' | 'print'

export interface ServiceText {
  name: string
  short: string
  lede: string
  when: string[]
  flow: [string, string][]
  spec: [string, string][]
}

export interface ServiceDef {
  key: ServiceKey
  slug: string
  /** Yönetim panelindeki eski hizmet kayıtlarının slug'ları (görsel/metin eşleştirme) */
  dbSlugs: string[]
  discipline: DisciplineId
  files: string[]
  viz: VizMode
  part: PartName
  software: SoftwareSlug[]
  text: Localized<ServiceText>
}

export const SERVICES: ServiceDef[] = [
  {
    key: 'tarama', slug: '3d-tarama', dbSlugs: ['3d-tarama', 'plastik-restorasyon'], discipline: 'muhendislik',
    files: ['STL', 'OBJ', 'PLY', 'PDF'], viz: 'points', part: 'gear', software: ['fixral-3d-splitter'],
    text: {
      tr: {
        name: '3D Tarama', short: 'Parçanın yüzeyini ölçülebilir bir nokta bulutuna çeviriyoruz.',
        lede: 'Elinizdeki parçayı yapılandırılmış ışıkla tarıyor, hizalanmış ve temizlenmiş bir yüzey modeli olarak teslim ediyoruz. Restorasyon, kalite kontrol ve tersine mühendislik buradan başlar.',
        when: ['Parçanın çizimi ya da CAD modeli yok', 'Üretilen parçayı orijinal modelle karşılaştırmak gerekiyor', 'Kırılmadan önce bir parçanın kaydını almak istiyorsunuz', 'Montaj boşluğu ya da gövde ölçüsü alınacak'],
        flow: [['Hazırlık', 'Yüzey matlaştırma, referans hedefleri'], ['Tarama', 'Çok açıdan çekim ve hizalama'], ['Temizlik', 'Gürültü ayıklama, delik kapatma'], ['Teslim', 'Mesh dosyası ve ölçüm raporu']],
        spec: [['Tarama çözünürlüğü', '20 µm'], ['Tolerans', '±0,05 mm'], ['Yüzey', 'Parlak yüzeyler matlaştırılır'], ['Çıktı', 'STL · OBJ · PLY · PDF rapor']],
      },
    },
  },
  {
    key: 'tersine', slug: 'tersine-muhendislik', dbSlugs: ['tersine-muhendislik', 'restorasyon-danismanlik'], discipline: 'muhendislik',
    files: ['STEP', 'IGES', 'Parasolid', 'DWG'], viz: 'wire', part: 'gear', software: ['fixral-cfd-simulator'],
    text: {
      tr: {
        name: 'Tersine Mühendislik', short: 'Taramadan düzenlenebilir, parametrik CAD modeline.',
        lede: 'Tarama verisini ya da kumpasla alınmış ölçüleri, ölçüleri değiştirilebilen parametrik bir modele çeviriyoruz. Modül, adım ve tolerans gibi tasarım niyetini yeniden kuruyoruz; yalnızca yüzeyi kopyalamıyoruz.',
        when: ['Üreticisi parçayı artık satmıyor', 'Kırık ya da aşınmış parçanın aslı yeniden çizilecek', 'Parçada iyileştirme yapılacak: daha kalın et, farklı malzeme', 'Kalıp ya da CNC için temiz katı model gerekiyor'],
        flow: [['Ölçüm', 'Tarama veya el ölçüsü'], ['Niyet', 'Simetri, modül, standart ölçüler'], ['Modelleme', 'Parametrik katı model'], ['Doğrulama', 'Sapma haritası ve teknik resim']],
        spec: [['Model tipi', 'Parametrik katı / yüzey'], ['Sapma kontrolü', 'Renkli sapma haritası'], ['Standart', 'ISO 2768-m varsayılan'], ['Çıktı', 'STEP · IGES · native']],
      },
    },
  },
  {
    key: 'otomotiv', slug: 'otomotiv-elektronigi', dbSlugs: ['otomotiv-elektronigi', 'extreme-ecu-cozumleri', 'arac-restorasyon'], discipline: 'muhendislik',
    files: ['CAN log', 'PCB', 'Firmware', 'PDF'], viz: 'solid', part: 'enclosure', software: ['esp32-s3-obd2'],
    text: {
      tr: {
        name: 'Otomotiv Elektroniği', short: 'ECU, OBD-II ve CAN-bus üzerinde okuma, analiz, yeniden üretim.',
        lede: 'Araç beyinleri, gösterge ve konfor modülleriyle çalışıyoruz: veri okuma, CAN-bus analizi, arızalı kartın yeniden üretimi ve klasik araçlar için bulunmayan elektronik parçalar.',
        when: ['Klasik araçta bulunmayan bir elektronik modül var', 'OBD-II / CAN-bus verisini okumak, kaydetmek ya da araç içinde göstermek gerekiyor', 'ECU kutusu ya da konnektör yuvası kırık', 'Araca özel bir ölçüm ya da kontrol kartı gerekiyor'],
        flow: [['Teşhis', 'Kart ve bağlantı analizi'], ['Okuma', 'OBD-II / CAN kayıt'], ['Tasarım', 'Kart ve kutu'], ['Test', 'Araç üstünde doğrulama']],
        spec: [['Protokol', 'OBD-II · CAN 2.0B · K-line · LIN'], ['Adaptör', 'ELM327 (BLE) ve doğrudan CAN'], ['Gerilim', '12 V / 24 V sistemler'], ['Çıktı', 'Kart + firmware + rapor']],
      },
    },
  },
  {
    key: 'cad', slug: 'cad-3d-cizim', dbSlugs: ['cad-3d-cizim', '3d-modelleme-hizmetleri'], discipline: 'tasarim',
    files: ['STEP', 'DXF', 'DWG', 'PDF'], viz: 'wire', part: 'bracket', software: ['fixral-cfd-simulator'],
    text: {
      tr: {
        name: 'CAD ve 3D Çizim', short: 'Eskizden, fotoğraftan ya da ölçüden üretim çizimine.',
        lede: 'Kâğıttaki eskizi, ölçülü fotoğrafı ya da tarif edilen fikri üretilebilir bir 3D modele ve teknik resme çeviriyoruz. Baskı, CNC ya da kalıp; hangi yöntemle üretileceğini baştan hesaba katıyoruz.',
        when: ['Elinizde bir eskiz ya da fikir var, model yok', 'Fason atölye teknik resim istiyor', 'Mevcut modelde montaj sorunu çıktı', 'Ürün sunumu için temiz render gerekiyor'],
        flow: [['Brif', 'Ölçü, malzeme, adet'], ['Model', 'Parametrik 3D'], ['Resim', 'Ölçülendirme, tolerans'], ['Revizyon', 'İki tur düzeltme']],
        spec: [['Yazılım', 'Fusion 360 · SolidWorks'], ['Resim', 'ISO 128'], ['Toleranslar', 'Üretim yöntemine göre'], ['Çıktı', 'STEP · DXF · PDF']],
      },
    },
  },
  {
    key: 'pcb', slug: 'pcb-gerber', dbSlugs: ['pcb-gerber'], discipline: 'tasarim',
    files: ['Gerber', 'Excellon', 'BOM', 'CPL'], viz: 'solid', part: 'pcb', software: ['router-studio'],
    text: {
      tr: {
        name: 'PCB ve Gerber', short: 'Şemadan dizgiye hazır kart dosyalarına.',
        lede: 'Devre şemasını çiziyor, kartı yerleştirip yolluyor, üreticinin doğrudan kullanacağı Gerber, delik ve dizgi dosyalarını hazırlıyoruz. Eski bir kartı fotoğraf ve ölçüden yeniden çizmek de bu işin parçası.',
        when: ['Prototip devre breadboard\'dan karta geçecek', 'Arızalı ve muadili olmayan bir kart yeniden üretilecek', 'Mevcut kart küçültülecek ya da revize edilecek', 'Dizgi firması dosya seti istiyor'],
        flow: [['Şema', 'Devre ve parça seçimi'], ['Yerleşim', 'Kart ve katman planı'], ['Yollama', 'DRC kontrolü'], ['Çıktı', 'Gerber ve dizgi seti']],
        spec: [['Katman', '2 – 4 katman'], ['Kontrol', 'DRC + ERC'], ['Prototip', 'Router Studio ile frezeleme'], ['Çıktı', 'Gerber · BOM · CPL']],
      },
    },
  },
  {
    key: 'gomulu', slug: 'gomulu-sistemler', dbSlugs: ['gomulu-sistemler'], discipline: 'tasarim',
    files: ['Firmware', 'Source', 'PCB', 'PDF'], viz: 'solid', part: 'pcb', software: ['esp32-s3-obd2'],
    text: {
      tr: {
        name: 'Gömülü Sistemler', short: 'ESP32 tabanlı kart, firmware ve dokunmatik ekran arayüzü.',
        lede: 'ESP32 üzerinde çalışan ölçüm, kontrol ve gösterge cihazları geliştiriyoruz: sensör okuma, dokunmatik ekran arayüzü, Wi-Fi / BLE ile veri aktarma. Açık kaynak OBD-II göstergemiz bu işin bir örneği. Kartı, kutusunu ve yazılımını birlikte teslim ediyoruz.',
        when: ['Bir makineye uzaktan izleme eklenecek', 'Sensör verisi toplanıp kaydedilecek', 'Basit bir PLC işi için düşük maliyetli kart gerekiyor', 'Prototip cihaz sahaya çıkacak'],
        flow: [['Gereksinim', 'Giriş, çıkış, güç'], ['Kart', 'ESP32 ve çevre birimleri'], ['Firmware', 'Sürücü ve uygulama'], ['Saha', 'Kurulum ve test']],
        spec: [['Çip', 'ESP32 · ESP32-S3 · C3'], ['Yazılım', 'ESP-IDF · LVGL · NimBLE'], ['Bağlantı', 'Wi-Fi · BLE · CAN · RS-485'], ['Arayüz', 'I²C · SPI · UART · ADC · dokunmatik ekran']],
      },
    },
  },
  {
    key: 'baski', slug: '3d-baski', dbSlugs: ['3d-baski', '3d-baski-hizmetleri', 'prototipleme-hizmetleri'], discipline: 'uretim',
    files: ['3MF', 'STL', 'PDF'], viz: 'print', part: 'impeller', software: ['fixral-3d-splitter'],
    text: {
      tr: {
        name: '3D Baskı', short: 'FDM, SLA ve SLS ile prototipten küçük seriye.',
        lede: 'Doğrulanmış modeli, parçanın göreceği yük ve ısıya uygun malzemeyle basıyoruz. Tablaya sığmayan modelleri kendi aracımız Fixral 3D Splitter ile pimli, numaralı parçalara bölüyor, ilk parçayı ölçüp seriye öyle geçiyoruz.',
        when: ['Fonksiyonel prototip lazım', 'Kalıp açmaya değmeyecek 1 – 200 adetlik iş', 'Restore edilen parçanın üretimi', 'Fikstür, aparat ve atölye ekipmanı'],
        flow: [['Kontrol', 'Et kalınlığı, yön'], ['Dilimleme', 'Katman ve dolgu'], ['Baskı', 'İlk parça ölçümü'], ['Son işlem', 'Destek, zımpara, boya']],
        spec: [['Yöntem', 'FDM · SLA · SLS'], ['Malzeme', 'PLA · PETG · ASA · PA12 · TPU · reçine'], ['Büyük modeller', 'Fixral 3D Splitter ile bölme'], ['Katman', '0,05 – 0,3 mm']],
      },
    },
  },
  {
    key: 'cnc', slug: 'cnc-cam', dbSlugs: ['cnc-cam', 'kurumsal-bireysel-yazilim'], discipline: 'uretim',
    files: ['G-code', 'CAM', 'Post', 'PDF'], viz: 'solid', part: 'bracket', software: ['router-studio'],
    text: {
      tr: {
        name: 'CNC ve CAM', short: 'Takım yolu, G-kodu, post-işlemci ve makine kurulumu.',
        lede: 'Freze ve router için takım yolu ve G-kodu hazırlıyor, makinenize uygun post-işlemci yazıyoruz. Küçük atölye makineleri için kendi geliştirdiğimiz Router Studio ile tasarımdan GRBL kontrolüne kadar her adımı tarayıcıdan yönetiyoruz.',
        when: ['Makine var, takım yolu hazırlayan yok', 'Hazır post-işlemci makinenizle uyumsuz', 'Aynı parça ailesi için hızlı program üretmek istiyorsunuz', 'Fikstür ve bağlama aparatı gerekiyor'],
        flow: [['Model', 'Bağlama ve sıfır noktası'], ['Strateji', 'Kaba ve finiş'], ['Simülasyon', 'Çarpışma kontrolü'], ['Kod', 'Post ve deneme']],
        spec: [['Makine', '3 eksen freze · router'], ['Kontrol', 'GRBL · Fanuc · Mach3 · LinuxCNC'], ['Yazılım', 'Router Studio · özel post-işlemci'], ['Çıktı', 'G-kodu + post + föy']],
      },
    },
  },
]

export const DISCIPLINES: DisciplineDef[] = [
  {
    id: 'muhendislik', en: 'ENGINEERING', services: ['tarama', 'tersine', 'otomotiv'],
    text: {
      tr: { name: 'Mühendislik', body: 'Var olan parçayı ölçer, verisini çıkarırız. Çizimi olmayan parçanın da bir ölçüsü vardır.' },
    },
  },
  {
    id: 'tasarim', en: 'DESIGN', services: ['cad', 'pcb', 'gomulu'],
    text: {
      tr: { name: 'Tasarım', body: 'Ölçüyü üretilebilir dosyaya çeviririz: parametrik model, devre kartı, gömülü yazılım.' },
    },
  },
  {
    id: 'uretim', en: 'MANUFACTURE', services: ['baski', 'cnc'],
    text: {
      tr: { name: 'Üretim', body: 'Dosyayı parçaya çeviririz. Baskı ve talaşlı imalat aynı atölyede, aynı modelden.' },
    },
  },
]

export const getService = (key: ServiceKey) => SERVICES.find((s) => s.key === key)!
export const getServiceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug || s.dbSlugs.includes(slug))

/* ---------------------------------------------------------------------- Süreç */

export interface ProcessStep { title: string; body: string; spec: [string, string][] }

export const PROCESS: Localized<ProcessStep[]> = {
  tr: [
    { title: 'Tara', body: 'Parça yapılandırılmış ışıkla, çok açıdan taranır. Her geçişte yüzey biraz daha noktaya dönüşür.', spec: [['Çözünürlük', '20 µm'], ['Veri', '≈ 2,4 M nokta'], ['Çıktı', 'PLY · STL']] },
    { title: 'Modelle', body: 'Nokta bulutu, ölçüleri değiştirilebilen parametrik bir katı modele çevrilir. Modül, adım, delik çapı yeniden kurulur.', spec: [['Yöntem', 'Parametrik katı'], ['Kenar', 'Özellik tabanlı'], ['Çıktı', 'STEP · IGES']] },
    { title: 'Doğrula', body: 'Model, taramanın üstüne bindirilir. Her nokta için sapma hesaplanır; tolerans dışı bölge kalmayana kadar model düzeltilir.', spec: [['Tolerans', '±0,05 mm'], ['Kontrol', 'Renkli sapma haritası'], ['Çıktı', 'PDF rapor']] },
    { title: 'Üret', body: 'Doğrulanan model baskıya ya da CNC\'ye gider. İlk parça ölçülür, seri ondan sonra başlar.', spec: [['Yöntem', 'FDM · SLA · SLS · CNC'], ['Katman', '0,1 mm'], ['Çıktı', 'Parça + ölçüm']] },
  ],
}

/* ------------------------------------------------------------------- Teslimat */

export const DELIVERABLES: Localized<[string, string][]> = {
  tr: [['STEP / IGES', 'Düzenlenebilir katı model'], ['STL / 3MF', 'Baskıya hazır ağ'], ['Gerber', 'Kart üretim seti'], ['G-kodu', 'Makineye özel program'], ['Firmware', 'Derlenmiş + kaynak kod'], ['PDF rapor', 'Ölçüm ve sapma tablosu']],
}

export type DocLine = ['c' | 'k' | 'n', string]
export const SAMPLE_DOCS: { id: 'gcode' | 'bom' | 'report'; file: string; lines: DocLine[] }[] = [
  {
    id: 'gcode', file: 'fikstur.nc', lines: [
      ['c', '; FIXRAL · FX-0412 fikstür plakası · Al 6061'], ['c', '; T3 Ø6 mm karbür freze · 3 ağız'],
      ['k', 'G21 G90 G17'], ['k', 'G54'], ['k', 'M06 T03'], ['k', 'S12000 M03'],
      ['n', 'G00 X0.000 Y0.000 Z5.000'], ['n', 'G01 Z-1.500 F320'], ['n', 'G01 X120.000 Y0.000 F800'], ['n', 'G01 X120.000 Y45.000'],
      ['n', 'G02 X110.000 Y55.000 I-10.000 J0.000'], ['n', 'G01 X0.000 Y55.000'], ['n', 'G01 X0.000 Y0.000'], ['k', 'G00 Z25.000'], ['k', 'M05'], ['k', 'M30'],
    ],
  },
  {
    id: 'bom', file: 'obd2_bom.txt', lines: [
      ['c', '# FX-OBD2 · Waveshare ESP32-S3-Touch-LCD-2.1'], ['k', 'Blok      Parça              Not'],
      ['n', 'MCU       ESP32-S3           LX7 · 240 MHz'], ['n', 'Ekran     ST7701 · 480×480   RGB arayüz'], ['n', 'Dokunma   CST226SE           kapasitif'],
      ['n', 'IMU       QMI8658            6 eksen · I²C'], ['n', 'IO        TCA9554            buzzer EXIO8'], ['n', 'Bellek    16 MB flash        octal PSRAM'],
      ['n', 'Bağlantı  NimBLE → ELM327    ATSP0'], ['c', '# 17 PID · EMA filtre · LVGL 8.4'],
    ],
  },
  {
    id: 'report', file: 'olcum_raporu.pdf', lines: [
      ['c', '# Ölçüm raporu · FX-0388 ara dişli'], ['k', 'Özellik         Nominal   Ölçülen  Sapma'],
      ['n', 'Dış çap         Ø64.00    Ø63.97   -0.03'], ['n', 'Modül           2.00      2.00      0.00'], ['n', 'Diş sayısı      30        30        —'],
      ['n', 'Göbek deliği    Ø20.00    Ø20.02   +0.02'], ['n', 'Kama genişliği  6.00      6.01     +0.01'], ['n', 'Kalınlık        18.00     17.96    -0.04'],
      ['c', '# Sonuç: tüm ölçüler ±0,05 mm içinde'],
    ],
  },
]

/* ------------------------------------------------------------------ Yazılımlar */

export type SoftwareSlug = 'fixral-3d-splitter' | 'router-studio' | 'fixral-cfd-simulator' | 'esp32-s3-obd2'
export type SoftwareViz = 'split' | 'toolpath' | 'flow' | 'gauge'

export interface SoftwareText {
  kicker: string
  status: string
  tagline: string
  lede: string
  chips: string[]
  facts: [string, string][]
  features: [string, string][]
  flow: [string, string][]
}

export interface SoftwareDef {
  slug: SoftwareSlug
  name: string
  version?: string
  viz: SoftwareViz
  url?: string
  repo: string
  services: ServiceKey[]
  text: Localized<SoftwareText>
}

export const SOFTWARE: SoftwareDef[] = [
  {
    slug: 'fixral-3d-splitter', name: 'Fixral 3D Splitter', version: '0.5.0', viz: 'split',
    url: 'https://fixral3d.github.io/fixral-3d-splitter/', repo: 'https://github.com/fixral3d/fixral-3d-splitter',
    services: ['baski', 'tarama'],
    text: {
      tr: {
        kicker: '3D baskı · tarayıcıda', status: 'Canlı · ücretsiz', tagline: 'Büyük 3D modelleri yazıcınıza sığdırır.',
        lede: 'Tablaya sığmayan STL modeli yazıcı profilinize göre parçalara böler, kesitlere pim, kavela ya da mıknatıs yuvası ekler, parçaları numaralayıp tabla başına baskıya hazır dışa aktarır. CAD\'de saatler süren iş yaklaşık bir dakikada biter. Model hiçbir sunucuya yüklenmez; bütün geometri işlemleri tarayıcıda, WebAssembly ile yapılır.',
        chips: ['v0.5 · stüdyo görünüm', 'STL → renkli 3MF', '10 dil', 'Kurulum yok'],
        facts: [['Girdi', 'STL'], ['Çıktı', 'STL (ZIP) · tabla başına renkli 3MF ya da STL · teklif.html'], ['Yazıcı profili', 'Bambu Lab · Prusa · Creality · Elegoo · özel'], ['Arayüz', '10 dil · Arapça sağdan sola · sesli asistan Dot'], ['Platform', 'Bilgisayar, tablet, telefon']],
        features: [
          ['Otomatik bölme', 'Yazıcı profiline göre kesim; ince şerit bırakmayan kesim optimizasyonu. Kesit düzlemlerini sürükleyin ya da serbest eğriyle kesin.'],
          ['Kesiti izleyen bağlantılar', 'Piramit ya da silindir pim, Ø6 / Ø8 / Ø10 mıknatıs yuvası, ahşap kavela, kırlangıç kuyruğu ve bindirme; şablon kartında birleşme canlı önizlenir. Kesit yüzüne "03-07" gibi eş etiket kazınır: 03 numaralı parça 07\'ye takılır.'],
          ['Elle ölçülendirilen pimler', 'Her pim ve kavelanın çapı, boyu, tipi, uç inceltmesi ve boşluğu canlı kesit önizlemesiyle ayrı ayarlanır. Uygula yalnızca etkilenen iki parçayı yeniden üretir; farklı ölçülü kavelalar ayrı STL / 3MF olarak çıkar.'],
          ['Stüdyo görünüm', 'Sıcak ana ışık, soğuk dolgu ve kenar ışığı, yumuşak gölgeler, seçili parçada kontur. Görünüm menüsü (V), odak modu (P), sahnede X / Y / Z ölçüleri ve 12 klavye kısayolu.'],
          ['Model ve baskı hazırlığı', 'Mesh onarma, sadeleştirme, ölçek, döndürme, içini boşaltma, akıllı seçip ayırma. Parçalar en iyi yüzleriyle tablalara yerleşir; yüzeyi izleyen skirt, mouse ear ve 8 filament profili.'],
          ['Yerleşik teklif', 'Filament, baskı süresi, makine, montaj, hazırlık ve kâr payından maliyet hesabı; yazdırılabilir montaj kılavuzu.'],
        ],
        flow: [['Hazırla', 'STL\'i onar, ölçekle'], ['Ön böl', 'Yazıcı profiline göre'], ['Böl', 'Parçalar saniyeler içinde'], ['Parçala', 'Pim ekle, ölçülendir; ZIP / 3MF'], ['Bas', 'Tabla başına STL ya da 3MF']],
      },
    },
  },
  {
    slug: 'router-studio', name: 'Router Studio', version: '2.0.0', viz: 'toolpath',
    url: 'https://fixral3d.github.io/cnc-controller/', repo: 'https://github.com/fixral3d/cnc-controller',
    services: ['cnc', 'pcb'],
    text: {
      tr: {
        kicker: 'CNC · CAM · GRBL', status: 'Canlı · ücretsiz', tagline: 'Tarayıcıda CNC tasarım, CAM ve GRBL kontrolü.',
        lede: 'Çizimden G-koduna, G-kodundan makineye tek uygulama. Şekil ve yazıyla tasarlar, V-oyma, cep ve 3D oyma takım yollarını üretir, simülasyonda kontrol edip makinenizi Web Serial üzerinden GRBL ile sürersiniz. Oyma sınırı yok; dosyalarınız bilgisayarınızdan çıkmaz.',
        chips: ['GRBL', 'PCB frezeleme', 'TR · EN · DE'],
        facts: [['Girdi', 'STL · OBJ · 3MF · fotoğraf · DXF · SVG · Gerber'], ['Çıktı', 'G-kodu'], ['Kontrolcü', 'GRBL · Web Serial'], ['Tarayıcı', 'Makine kontrolü Chrome / Edge · indirme her tarayıcıda'], ['Örnek donanım', 'Arduino CNC Shield · 3018 router']],
        features: [
          ['Tasarım editörü', 'Şekiller, 6 yazı tipiyle metin, serbest çizim, nokta düzenleme, ofset; birleştir, çıkar, kesiştir.'],
          ['2D ve V-oyma', 'Düz taban temizlemeli V-oyma, V-inlay, dokulu cep, raster cep, rampalı dalış.'],
          ['3D oyma', 'Kaba işleme ve küresel uçla finiş, kalıp, parçayı serbest kesme.'],
          ['PCB frezeleme', 'Gerber ve Excellon girişi; izolasyon, delme ve köprülü dış kontur.'],
          ['Yerleşim ve üreticiler', 'Nesting, stoğu doldurma, döşeme. Kutu, dişli, labirent, petek, delik ızgarası, radyal dizi, dog-bone.'],
          ['Simülasyon ve kontrol', '3D simülasyon, jog, Z sıfır / prob, auto-level, ilerleme override, satırdan devam, makine profilleri.'],
        ],
        flow: [['Tasarla', 'Şekil, yazı, DXF / SVG'], ['Takım yolu', 'Cep, V-oyma, 3D'], ['Simüle et', '3D önizleme'], ['Kes', 'GRBL ile Web Serial']],
      },
    },
  },
  {
    slug: 'fixral-cfd-simulator', name: 'Fixral CFD Simulator', version: '0.2.0', viz: 'flow',
    url: 'https://fixral3d.github.io/fixral-cfd-simulator/', repo: 'https://github.com/fixral3d/fixral-cfd-simulator',
    services: ['cad', 'tersine'],
    text: {
      tr: {
        kicker: 'CFD · rüzgâr ve su tüneli', status: 'Canlı · ücretsiz', tagline: 'Tarayıcıda çalışan rüzgâr ve su tüneli.',
        lede: 'STL, OBJ, 3MF ya da STEP modelinizi yükleyin; hava ya da su akışında sürükleme ve kaldırma katsayılarını (Cd, Cl), kuvvetleri, basınç dağılımını, akım çizgilerini ve serbest yüzeyli suyu görün. Hesap WebGPU ile kendi cihazınızda yapılır; kurulum, hesap ya da dosya yükleme yok. Tasarımları ve eğilimleri karşılaştırmak için bir ön tasarım aracıdır, sertifikasyon için değildir.',
        chips: ['v0.2 · WebGPU', 'Hava + su', 'STEP / IGES', 'Kurulum yok'],
        facts: [['Girdi', 'STL (ikili / ASCII) · OBJ · 3MF · STEP · IGES'], ['Çıktı', 'Cd · Cl · kuvvet · sürükleme gücü; PNG · CSV · JSON'], ['Çözücü', 'D3Q19 Lattice Boltzmann (düzenlenmiş BGK + Smagorinsky LES) · serbest yüzey için MLS-MPM, ~340 bin parçacık'], ['Hesap', 'WebGPU (WGSL) · desteklemeyen tarayıcıda Web Worker ile CPU'], ['Tarayıcı', 'Chrome / Edge · Safari 26+ · Firefox 141+ (macOS 145+)']],
        features: [
          ['Model ve örnekler', 'STL, OBJ, 3MF, STEP ve IGES; STEP / IGES için OpenCascade yalnızca gerektiğinde yüklenir. Birim (mm, cm, m, inç), döndürme, hücum ve sapma açısı. Hazır örnekler: otomobil, Ahmed gövdesi, NACA 2412 kanat, silindir, küre, 44 mm küp.'],
          ['Hava akışı', '3D Lattice Boltzmann (D3Q19), düzenlenmiş BGK ve Smagorinsky LES türbülans modeli. Hız m/s, km/sa, mph, knot ya da ft/s; altı akış yönü.'],
          ['Su akışı', 'Kanal / havuz, dış akım ve tamamen batık olmak üzere üç mod. Derinlik, genişlik ve viskozite ayarı; serbest yüzeyli su MLS-MPM parçacık çözücüsüyle hesaplanır.'],
          ['Görselleştirme', 'Akım çizgileri, yüzey basıncı, yüzey hızı, boya / duman ve kesit düzlemi; su yüzeyi için ayrı görünüm modları. Prob (I) bir noktadaki hızı, Cp\'yi ve basıncı okur.'],
          ['Canlı ölçüm ve sonuç', 'Adım, FPS, MLUPS, Cd, Re ve Cd geçmişi canlı izlenir. Sonuçta Cd, Cl, kuvvetler, sürükleme gücü, yakınsama, hız ve basınç aralıkları; suda kavitasyon riski.'],
          ['Ekran ve dışa aktarma', 'Performans modları, arka plan, ışık, gölge ve görünürlük ayarları (V). Sonuçlar PNG, CSV ve JSON olarak iner. Kısayollar: Boşluk başlat / duraklat, R sıfırla, P paneli gizle, 1–4 adımlar, S kesit.'],
        ],
        flow: [['Model', 'Dosya ya da örnek; birim, yön, açılar'], ['Ortam', 'Hava ya da su, hız, akış yönü'], ['Simülasyon', 'Çözücüyü başlat, görünüm seç'], ['Sonuç', 'Cd, Cl, kuvvet; PNG · CSV · JSON']],
      },
    },
  },
  {
    slug: 'esp32-s3-obd2', name: 'ESP32-S3 OBD-II', viz: 'gauge',
    repo: 'https://github.com/erdemerciyas/ESP32-S3-OBD2',
    services: ['gomulu', 'otomotiv'],
    text: {
      tr: {
        kicker: 'Gömülü · otomotiv', status: 'Açık kaynak FIRMWARE', tagline: 'Aracın verisini yuvarlak bir ekranda canlı gösterir.',
        lede: 'ESP32-S3 tabanlı 2,1" yuvarlak dokunmatik ekran için firmware. Bluetooth LE ile ELM327 adaptörüne bağlanır, protokolü kendisi bulur, 17 PID\'i okuyup filtreler; devir, hız, su sıcaklığı ve akü gerilimini gösterge olarak çizer.',
        chips: ['ESP-IDF 5.3', 'LVGL 8.4', 'BLE · ELM327'],
        facts: [['Kart', 'Waveshare ESP32-S3-Touch-LCD-2.1'], ['Ekran', '480 × 480 yuvarlak · kapasitif dokunmatik'], ['Bağlantı', 'BLE (NimBLE) → ELM327 · ATSP0'], ['Veri', '17 PID · EMA filtre'], ['Sensör', 'QMI8658 6 eksen IMU']],
        features: [
          ['Ana gösterge', '270° yay üzerinde devir ya da hız; çift dokunuşla değişir. 9 segment vites ışığı ve kırmızı bölge.'],
          ['Canlı veri', '3 × 3 ızgarada dokuz PID. Her değerde EMA filtre ve sıçrama ayıklama.'],
          ['Off-road ekranı', 'IMU ile eğim, yalpa ve yön; jiroskop kalibrasyonu.'],
          ['Sıcaklık uyarısı', 'Su sıcaklığı kritik seviyeye çıkınca sesli uyarı.'],
          ['Ayarlar', 'Araç profilleri, birimler, otomatik bağlanma, gösterge kaynağı.'],
          ['PC simülatörü', 'Aynı arayüz kodu Visual Studio\'da çalışır; donanım olmadan tasarım.'],
        ],
        flow: [['Bağlan', 'BLE tarama, ELM327'], ['Bul', 'Protokol ve PID keşfi'], ['Oku', '17 PID, filtre'], ['Göster', '5 ekran, kaydırarak']],
      },
    },
  },
]

export const getSoftware = (slug: string) => SOFTWARE.find((s) => s.slug === slug)

/* ----------------------------------------------------------------- Linkler */

export const fxPath = (lang: string, path = '') => `/${toFxLocale(lang)}${path}`
export const serviceHref = (lang: string, s: { slug: string }) => fxPath(lang, `/services/${s.slug}`)
export const softwareHref = (lang: string, s: { slug: string }) => fxPath(lang, `/software/${s.slug}`)
export const newsBase = (_lang?: string) => '/tr/haberler'
