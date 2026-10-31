/**
 * Fixral 3D Splitter ürün sayfası vitrini — videolar, interaktif kullanım
 * kılavuzu, bağlantı tipleri, ekran görüntüleri, kısayollar ve SSS.
 * Kaynak: github.com/fixral3d/fixral-3d-splitter README (v0.5.0) ve
 * YouTube kanalındaki tanıtım videolarının açıklamaları.
 */

export const SPLITTER_SLUG = 'fixral-3d-splitter'
export const SPLITTER_APP = 'https://fixral3d.github.io/fixral-3d-splitter/'

export interface SplitterChapter { at: number; label: string }
export interface SplitterVideo {
  id: string
  tab: string
  title: string
  lang: 'tr' | 'en'
  uploadDate: string
  chapters: SplitterChapter[]
}

export const SPLITTER_VIDEOS: SplitterVideo[] = [
  {
    id: 'C53xxlPbuyc', tab: 'Türkçe anlatım', lang: 'tr', uploadDate: '2026-10-29T22:08:16Z',
    title: 'Büyük 3D modelleri yazıcına sığdır: 5 adımda böl, birleştir, bas',
    chapters: [
      { at: 0, label: 'Giriş ve 5 adımda bölme' },
      { at: 19, label: 'Akıllı bölme, etiketler ve pimler' },
      { at: 38, label: 'Tablaya yerleşim ve çubuklu skirt' },
      { at: 51, label: 'Dot, 10 dil ve gizlilik' },
      { at: 65, label: 'Fiyat teklifi ve tüm özellikler' },
    ],
  },
  {
    id: 'VT2mjJMPj68', tab: 'v0.5 yenilikleri · EN', lang: 'en', uploadDate: '2026-10-31T14:34:14Z',
    title: 'v0.5: elle ölçülendirilen pimler, tabla başına renkli 3MF',
    chapters: [
      { at: 0, label: 'Neden model bölücü?' },
      { at: 13, label: 'v0.5’te neler yeni' },
      { at: 20, label: '5 adımlık akış' },
      { at: 49, label: 'Stüdyo görünüm ve elle ölçülendirilen pimler' },
      { at: 65, label: 'Görünüm menüsü, kısayollar, odak modu' },
      { at: 77, label: 'Tabla yerleşimi ve 3MF dışa aktarma' },
      { at: 93, label: 'Çubuklu skirt, Dot, 10 dil, gizlilik' },
      { at: 114, label: 'Fiyat teklifi ve bağlantı' },
    ],
  },
]

export const SPLITTER_SHORTS = [
  { id: 'lccoCLDSusY', title: 'Yazıcına sığmayan modeli 5 adımda böl' },
  { id: '3pn0P_-VOQ8', title: 'v0.5: her pimi elle ölçülendir (EN)' },
]

/* ------------------------------------------------------------ Kullanım kılavuzu */

export interface SplitterStep {
  key: string
  title: string
  short: string
  body: string
  actions: string[]
  tip: string
  shot?: string
}

export const SPLITTER_STEPS: SplitterStep[] = [
  {
    key: 'prepare', title: 'Hazırla', short: 'Modeli yükle, onar, ölçekle',
    body: 'STL dosyasını sahneye sürükleyin ya da örnek modeli açın. Model otomatik kontrol edilir; açık kenar ve ters yüzler onarılır. Boyutu, yönü ve doluluğu bu adımda ayarlarsınız.',
    actions: [
      'İkili ya da ASCII STL; mesh otomatik onarılır',
      'Ölçek: bir eksene "850mm", "120%" ya da "1.5" yazın, diğerleri orantılı değişir',
      'Döndürme, sadeleştirme ve içini boşaltma (kesimlere dolu bölme eklenir)',
      'Sahnede X / Y / Z ölçüleri eksen renkleriyle görünür',
    ],
    tip: 'En iyi sonuç için kapalı (su geçirmez) bir mesh kullanın. Kulak, burun gibi ince detayları "akıllı seç & ayır" ile ayrı parçaya alabilirsiniz.',
    shot: 'prepare',
  },
  {
    key: 'plan', title: 'Ön böl', short: 'Yazıcıyı seç, kesimleri planla',
    body: 'Yazıcınızı seçin; kesim düzlemleri baskı hacmine göre kendiliğinden yerleşir. Düzlemleri sahnede sürükleyebilir, serbest eğriyle kesebilir, birleştirme şablonunu seçebilirsiniz.',
    actions: [
      'Hazır profiller: Bambu Lab, Prusa, Creality, Elegoo ya da özel ölçü',
      'Kenar payı ile hacmin sınırına yapışmayan güvenli kesim',
      'Kesim optimizasyonu ince şerit parça bırakmaz',
      'Şablon kartının üzerine gelince birleşme canlı önizlenir',
    ],
    tip: 'Kendi yazıcınızı "Yazıcı olarak kaydet" ile saklayın; bir sonraki modelde tek tıkla seçilir.',
    shot: 'templates',
  },
  {
    key: 'split', title: 'Böl', short: 'Parçalar saniyeler içinde',
    body: 'Tek tıkla (ya da Enter) bölme arka planda, WebAssembly ile yapılır. Pim, kavela ve mıknatıs noktaları kesitin şeklini izleyerek kalın bölgelere ve aralıklı yerleşir.',
    actions: [
      'Tüm geometri tarayıcıda; dosya hiçbir sunucuya gitmez',
      'Bağlantılar kesit boyunca, kalın bölgelere yakın dağılır',
      'Her kesim yüzüne eş etiket kazınır: 03-07',
      'Sığmayan ya da pim yeri olmayan kesitler raporlanır',
    ],
    tip: 'Sonuç satırı parça, dübel ve süre özetini verir; "2 kesitte pim için yer yok" gibi uyarılar size nereye elle bağlantı eklemeniz gerektiğini söyler.',
    shot: 'explode',
  },
  {
    key: 'explode', title: 'Parçala', short: 'İncele, düzenle, indir',
    body: 'Parçaları ayrık (patlatılmış) görünümde inceleyin. Parçaları birleştirin, silin, izole edin; kesim yüzüne tıklayarak pim ya da dübel ekleyin ve her birini ayrı ölçülendirin.',
    actions: [
      'Çap, boy, silindir / piramit, uç inceltmesi ve boşluk ayarı (v0.5)',
      '"Uygula" yalnızca etkilenen iki parçayı yeniden üretir',
      'Farklı ölçülü baskı kavelalar ayrı STL / 3MF olarak çıkar',
      'ZIP içinde STL ya da tek renkli 3MF olarak indir',
    ],
    tip: 'Ctrl + tık ile çoklu seçim, Del ile silme, Ctrl + Z ile geri alma çalışır. Etiketleri (L) ve renkleri (M) açıp kapatabilirsiniz.',
    shot: 'jointedit',
  },
  {
    key: 'print', title: 'Bas', short: 'Tablaya yerleştir, skirt ekle',
    body: 'Parçalar en uygun yüzleriyle baskı tablalarına yerleşir. Çeken filamentler için yüzeyi izleyen çubuklu skirt ve mouse ear eklenir; her tabla ayrı STL ya da renkli 3MF olarak çıkar.',
    actions: [
      'Her parça için otomatik en iyi baskı yüzü (ya da elle seçim)',
      'Bir tablaya birden fazla parça, parçalar arası boşluk ayarı',
      '8 filament profili: PLA, PETG, ABS, ASA, TPU, PA, PC, PLA-CF',
      'Tabla başına renkli 3MF, parçalar baskı konumunda (v0.5)',
    ],
    tip: 'Skirt çubukları baskıdan sonra yana bükülerek kırılır; destek eklenmez, o iş dilimleyicinizin.',
    shot: 'skirt',
  },
]

/* ------------------------------------------------------------ Bağlantı tipleri */

export type JointKind = 'pyramid' | 'cylinder' | 'magnet' | 'dowel' | 'dovetail' | 'lap'

export interface SplitterJoint {
  kind: JointKind
  name: string
  size: string
  buy?: string
  body: string
  best: string
}

export const SPLITTER_JOINTS: SplitterJoint[] = [
  { kind: 'pyramid', name: 'Piramit pim', size: '10 mm taban', body: 'Parçanın üzerine basılır; konik yapısı sayesinde desteksiz basılır ve kendini merkezler. Önerilen varsayılan şablon.', best: 'Genel kullanım, desteksiz baskı' },
  { kind: 'cylinder', name: 'Silindir pim', size: 'Ø6 × 8 mm', body: 'Parçaya gömülü silindir pim ve karşı parçada yuvası. Sıkı, hizalı bir geçme verir; boşluk ayarı v0.5 ile elle yapılabilir.', best: 'Hassas hizalama, düz kesitler' },
  { kind: 'magnet', name: 'Neodim mıknatıs', size: 'Ø6 / Ø8 / Ø10 × 3 mm', buy: 'Neodim disk mıknatıs', body: 'İki kesite karşılıklı mıknatıs yuvası açılır. Parçalar yapıştırmadan birleşir ve tekrar sökülebilir.', best: 'Sökülebilir maket, kask, kostüm' },
  { kind: 'dowel', name: 'Ahşap kavela', size: 'Ø6 / Ø8 × 30 mm', buy: 'Ahşap kavela (dübel)', body: 'İki parçaya da kör delik açılır, araya hazır ahşap kavela girer. Yapıştırıcıyla en sağlam birleşimi verir.', best: 'Büyük, ağır parçalar' },
  { kind: 'dovetail', name: 'Kırlangıç kuyruğu', size: 'Kesit boyunca', body: 'Bir parçadaki genişleyen dil, karşı parçadaki yuvaya yandan kayarak girer; çekmeye karşı kilitlenir.', best: 'Yük taşıyan düz paneller' },
  { kind: 'lap', name: 'Bindirme', size: 'Kesitin yarısı', body: 'Kesitler basamaklı kesilir, parçalar üst üste biner. Geniş yapıştırma yüzeyi ve düz bir dış yüzey verir.', best: 'Plaka, tabela, düz yüzeyler' },
]

/* ------------------------------------------------------------ Ekran görüntüleri */

export interface SplitterShot { key: string; src: string; w: number; h: number; title: string; caption: string }

const shot = (key: string, w: number, h: number, title: string, caption: string): SplitterShot =>
  ({ key, src: `/images/software/fixral-3d-splitter/${key}.jpg`, w, h, title, caption })

export const SPLITTER_SHOTS: SplitterShot[] = [
  shot('prepare', 1600, 1000, 'Hazırla', 'Stüdyo ışığında model, kesim düzlemleri ve eksen renkli ölçü etiketleri.'),
  shot('templates', 1920, 1080, 'Ön bölme ve şablonlar', 'Yazıcı profili, kenar payı ve canlı önizlemeli birleştirme şablonları.'),
  shot('explode', 1600, 1000, 'Ayrık görünüm', 'Pim ve dübellerle bölünmüş model; seçili parça konturlu.'),
  shot('jointedit', 1920, 1080, 'Pim / dübel düzenleme', 'Kesim yüzüne tıklayarak pim ekleme, parça listesi ve eşleşmeler.'),
  shot('labels', 1920, 1080, 'Numaralı parçalar', 'Kesim yüzlerine kazınan etiketlerle patlatılmış görünüm.'),
  shot('skirt', 1920, 1080, 'Tabla ve çubuklu skirt', 'Parçalar tablalara yerleşik; yüzeyi izleyen skirt çubukları.'),
  shot('view-menu', 1600, 1000, 'Görünüm menüsü (V)', 'Göster / gizle, ışık, gölge, arka plan ve çalışma alanı ayarları.'),
  shot('lang-ar', 1920, 1080, '10 dil · sağdan sola', 'Arapça arayüz; yerleşim sağdan sola döner.'),
]

/* ------------------------------------------------------------ v0.5 ve kısayollar */

export const SPLITTER_RELEASE = {
  version: '0.5.0',
  date: '31 Ekim 2026',
  items: [
    ['Stüdyo görünüm', 'Sinematik ton eşleme, sıcak ana ışık, soğuk dolgu ve kenar ışığı; zemine ve parçaların birbirine düşen yumuşak gölgeler. 3 ışık modu, 3 arka plan.'],
    ['Elle ölçülendirilen pimler', 'Çap, boy, tip, uç inceltmesi ve boşluk; canlı kesit önizlemesi. İşaretçi kesim yüzüne yapışır.'],
    ['Tabla başına renkli 3MF', 'Her baskı tablası ayrı 3MF; parçalar baskı konumunda. İsterseniz tabla başına tek STL.'],
    ['Görünüm menüsü ve odak modu', 'V ile paneli, Dot\'u, ızgarayı, ölçüleri ve hacmi göster / gizle. P ile tam genişlik sahne; panel kenarından sürükleyerek genişler.'],
    ['Sahnede ölçüler', 'X / Y / Z boyutları doğrudan modelin üzerinde.'],
    ['Daha net sihirbaz', 'Adım 1/5 … 5/5, seçili parçada yeşil kontur, sürüm rozetinden "Hakkında" ve sürüm notları; Baskı adımı 10 dile çevrildi.'],
  ] as [string, string][],
}

export const SPLITTER_KEYS: [string, string][] = [
  ['1', 'Üstten görünüm'], ['2', 'Önden görünüm'], ['3', 'Yandan görünüm'], ['4', 'İzometrik görünüm'],
  ['F', 'Modele sığdır'], ['G', 'Izgara ve cetvel'], ['X', 'Kesit görünümü'], ['W', 'Tel kafes'],
  ['R', 'Döndür'], ['P', 'Paneli gizle / odak modu'], ['V', 'Görünüm menüsü'], ['Enter', 'Böl'],
]

/* ------------------------------------------------------------ SSS */

export const SPLITTER_FAQ: [string, string][] = [
  ['Ücretli mi, hesap gerekiyor mu?', 'Hayır. Fixral 3D Splitter ücretsizdir; kurulum ve hesap gerekmez. Bağlantıyı açıp kullanmaya başlarsınız.'],
  ['Modelim bir sunucuya yükleniyor mu?', 'Hayır. Tüm geometri işlemleri tarayıcınızda, WebAssembly ile yapılır; dosyanız bilgisayarınızdan çıkmaz.'],
  ['Hangi dosya biçimlerini destekliyor?', 'Girdi olarak ikili ya da ASCII STL. Çıktı olarak ZIP içinde STL, renkli 3MF, tabla başına STL / 3MF ve yazdırılabilir teklif ile montaj kılavuzu (teklif.html).'],
  ['Hangi yazıcılarla çalışır?', 'Bambu Lab, Prusa, Creality ve Elegoo profilleri hazır gelir; diğer yazıcılar için X / Y / Z baskı hacmini girip kendi profilinizi kaydedebilirsiniz.'],
  ['Telefonda ya da tablette kullanılabilir mi?', 'Evet. Uygulama bilgisayar, tablet ve telefonda çalışır; v0.5 ile üst çubuk dizüstü ve telefon ekranlarına sığar.'],
  ['Parçaları nasıl birleştiririm?', 'Şablona göre: basılmış pimler doğrudan geçer; mıknatıs ve ahşap kavela için gereken hazır parça ölçüsü şablon kartında yazılır. Kesim yüzündeki "03-07" etiketi hangi parçanın nereye takıldığını gösterir.'],
  ['Fiyat teklifi nasıl hesaplanıyor?', 'Filament, baskı süresi, malzeme, makine saati, montaj, hazırlık ve kâr payından tahmini bir teklif üretilir; ZIP içinde yazdırılabilir olarak gelir.'],
]
