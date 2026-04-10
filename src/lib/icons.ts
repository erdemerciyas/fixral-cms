import {
    HomeIcon,
    UserIcon,
    WrenchScrewdriverIcon,
    FolderOpenIcon,
    PhoneIcon,
    FilmIcon,
    SparklesIcon,
    RocketLaunchIcon,
    CodeBracketIcon,
    CpuChipIcon,
    GlobeAltIcon,
    PaintBrushIcon,
    MegaphoneIcon,
    ChartBarIcon,
    NewspaperIcon,
    CubeIcon,
    CubeTransparentIcon,
    CogIcon,
    BeakerIcon,
    WrenchIcon,
    MagnifyingGlassIcon,
    PrinterIcon,
    ScaleIcon,
    SwatchIcon,
    ArrowPathIcon,
    ViewfinderCircleIcon,
    DocumentMagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    CommandLineIcon,
    CircleStackIcon,
    Square3Stack3DIcon,
    LightBulbIcon,
    BoltIcon,
    ShieldCheckIcon,
    CalculatorIcon,
    MapIcon,
    SignalIcon,
    CameraIcon,
} from '@heroicons/react/24/outline';

export const getIconForPage = (pageId: string) => {
    const iconMap: Record<string, any> = {
        home: HomeIcon,
        about: UserIcon,
        services: WrenchScrewdriverIcon,
        portfolio: FolderOpenIcon,
        contact: PhoneIcon,
        videos: FilmIcon,
        news: NewspaperIcon,
    };
    return iconMap[pageId] || HomeIcon;
};

const iconRegistry: Record<string, any> = {
    HomeIcon,
    UserIcon,
    WrenchScrewdriverIcon,
    FolderOpenIcon,
    PhoneIcon,
    SparklesIcon,
    FilmIcon,
    RocketLaunchIcon,
    CodeBracketIcon,
    CpuChipIcon,
    GlobeAltIcon,
    PaintBrushIcon,
    MegaphoneIcon,
    ChartBarIcon,
    NewspaperIcon,
    CubeIcon,
    CubeTransparentIcon,
    CogIcon,
    BeakerIcon,
    WrenchIcon,
    MagnifyingGlassIcon,
    PrinterIcon,
    ScaleIcon,
    SwatchIcon,
    ArrowPathIcon,
    ViewfinderCircleIcon,
    DocumentMagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    CommandLineIcon,
    CircleStackIcon,
    Square3Stack3DIcon,
    LightBulbIcon,
    BoltIcon,
    ShieldCheckIcon,
    CalculatorIcon,
    MapIcon,
    SignalIcon,
    CameraIcon,
};

export const resolveIcon = (name?: string) => {
    if (!name) return undefined;
    return iconRegistry[name] || undefined;
};

const titleIconPatterns: Array<{ keywords: string[]; icon: string }> = [
    { keywords: ['tersine', 'reverse', 'engineering', 'mühendislik'], icon: 'ArrowPathIcon' },
    { keywords: ['3d tarama', '3d scan', 'tarama', 'scan'], icon: 'ViewfinderCircleIcon' },
    { keywords: ['3d model', 'modelleme', 'modeling', 'cad'], icon: 'CubeIcon' },
    { keywords: ['3d baskı', '3d print', 'baskı', 'print', 'prototip'], icon: 'PrinterIcon' },
    { keywords: ['kalite', 'kontrol', 'quality', 'ölçüm', 'measurement'], icon: 'ShieldCheckIcon' },
    { keywords: ['analiz', 'analysis', 'fea', 'simülasyon', 'simulation'], icon: 'BeakerIcon' },
    { keywords: ['tasarım', 'design', 'endüstriyel'], icon: 'SwatchIcon' },
    { keywords: ['üretim', 'manufacturing', 'imalat', 'cnc'], icon: 'CogIcon' },
    { keywords: ['danışmanlık', 'consulting', 'proje'], icon: 'LightBulbIcon' },
    { keywords: ['yazılım', 'software', 'dijital'], icon: 'CommandLineIcon' },
    { keywords: ['mekatronik', 'otomasyon', 'automation', 'robot'], icon: 'CpuChipIcon' },
    { keywords: ['lazer', 'laser', 'kesim'], icon: 'BoltIcon' },
    { keywords: ['harita', 'map', 'haritalama'], icon: 'MapIcon' },
    { keywords: ['fotoğraf', 'photo', 'görüntü'], icon: 'CameraIcon' },
];

export const resolveIconForService = (iconName?: string, title?: string) => {
    if (iconName && iconRegistry[iconName]) {
        return iconRegistry[iconName];
    }

    if (title) {
        const lower = title.toLowerCase();
        for (const pattern of titleIconPatterns) {
            if (pattern.keywords.some(kw => lower.includes(kw))) {
                return iconRegistry[pattern.icon];
            }
        }
    }

    return WrenchScrewdriverIcon;
};

export const availableIcons = [
    { name: 'WrenchScrewdriverIcon', label: 'Araçlar' },
    { name: 'ArrowPathIcon', label: 'Tersine Mühendislik' },
    { name: 'ViewfinderCircleIcon', label: '3D Tarama' },
    { name: 'CubeIcon', label: '3D Model' },
    { name: 'CubeTransparentIcon', label: '3D Şeffaf' },
    { name: 'PrinterIcon', label: '3D Baskı' },
    { name: 'CogIcon', label: 'Üretim / Mekanik' },
    { name: 'BeakerIcon', label: 'Analiz / Test' },
    { name: 'WrenchIcon', label: 'Anahtar' },
    { name: 'MagnifyingGlassIcon', label: 'Araştırma' },
    { name: 'ShieldCheckIcon', label: 'Kalite Kontrol' },
    { name: 'SwatchIcon', label: 'Tasarım' },
    { name: 'LightBulbIcon', label: 'Fikir / Danışmanlık' },
    { name: 'BoltIcon', label: 'Enerji / Lazer' },
    { name: 'CpuChipIcon', label: 'Elektronik / Otomasyon' },
    { name: 'CommandLineIcon', label: 'Yazılım' },
    { name: 'Square3Stack3DIcon', label: 'Katmanlar' },
    { name: 'AdjustmentsHorizontalIcon', label: 'Ayarlar / Kalibrasyon' },
    { name: 'DocumentMagnifyingGlassIcon', label: 'Doküman İnceleme' },
    { name: 'CircleStackIcon', label: 'Veri / Veritabanı' },
    { name: 'CalculatorIcon', label: 'Hesaplama' },
    { name: 'MapIcon', label: 'Harita' },
    { name: 'CameraIcon', label: 'Fotoğraf / Görüntü' },
    { name: 'SignalIcon', label: 'Sinyal' },
    { name: 'ScaleIcon', label: 'Ölçek / Terazi' },
    { name: 'RocketLaunchIcon', label: 'Roket / Başlat' },
    { name: 'GlobeAltIcon', label: 'Dünya' },
    { name: 'PaintBrushIcon', label: 'Fırça' },
    { name: 'SparklesIcon', label: 'Yıldız' },
    { name: 'HomeIcon', label: 'Ev' },
    { name: 'UserIcon', label: 'Kullanıcı' },
    { name: 'FolderOpenIcon', label: 'Klasör' },
    { name: 'PhoneIcon', label: 'Telefon' },
    { name: 'FilmIcon', label: 'Video' },
    { name: 'CodeBracketIcon', label: 'Kod' },
    { name: 'MegaphoneIcon', label: 'Megafon' },
    { name: 'ChartBarIcon', label: 'Grafik' },
    { name: 'NewspaperIcon', label: 'Haber' },
];
