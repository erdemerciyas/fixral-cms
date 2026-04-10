'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft,
    Check,
    Loader2,
    Image as ImageIcon,
    Type,
    MousePointerClick,
    Settings2,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ImageUpload from '@/components/ImageUpload';

interface SliderFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function SliderForm({ initialData, isEditing = false }: SliderFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        imageUrl: '',
        buttonText: 'Daha Fazla',
        buttonLink: '',
        order: 0,
        isActive: true,
        badge: 'Yenilik',
        duration: 5000,
        imageType: 'url',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                subtitle: initialData.subtitle || '',
                description: initialData.description || '',
                imageUrl: initialData.imageUrl || initialData.image || '',
                buttonText: initialData.buttonText || 'Daha Fazla',
                buttonLink: initialData.buttonLink || initialData.link || '',
                order: Number(initialData.order) || 0,
                isActive: initialData.isActive !== undefined ? initialData.isActive : (initialData.status === 'active'),
                badge: initialData.badge || 'Yenilik',
                duration: Number(initialData.duration) || 5000,
                imageType: initialData.imageType || 'url',
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name === 'isActive') {
            const boolValue = (e.target as HTMLSelectElement).value === 'true';
            setFormData(prev => ({ ...prev, [name]: boolValue }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: Number(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (url: string | string[]) => {
        const imageUrl = Array.isArray(url) ? url[0] : url;
        setFormData(prev => ({ ...prev, imageUrl }));
    };

    const handleRemoveImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
    };

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();
        setLoading(true);

        try {
            const url = isEditing
                ? `/api/admin/slider/${initialData._id}`
                : '/api/admin/slider';

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push('/admin/slider');
                router.refresh();
            } else {
                const data = await response.json();
                toast.error(data.error || 'İşlem başarısız');
            }
        } catch (error) {
            console.error('Error saving slider:', error);
            toast.error('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

    return (
        <div className="max-w-[1400px] mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 sticky top-0 z-20 bg-background/80 backdrop-blur-sm py-4 -mx-2 px-2">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/slider"
                        className="p-2 hover:bg-muted hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-border"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">
                            {isEditing ? 'Slider Düzenle' : 'Yeni Slider'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isEditing
                                ? (formData.title || 'Slider düzenleniyor...')
                                : 'Ana sayfa slider\'ına yeni bir slayt ekleyin'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/slider"
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        İptal
                    </Link>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        size="lg"
                        className="rounded-xl font-semibold"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {isEditing ? 'Güncelleniyor...' : 'Kaydediliyor...'}
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                {isEditing ? 'Değişiklikleri Kaydet' : 'Slider Oluştur'}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">

                    {/* === LEFT COLUMN: Main content === */}
                    <div className="space-y-6 min-w-0">

                        {/* Slider Image */}
                        <Card className="rounded-xl overflow-hidden p-0">
                            <CardHeader className="p-4 border-b border-border/60 bg-muted/30 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="font-semibold text-foreground flex items-center gap-2 text-base">
                                    <ImageIcon className="w-5 h-5 text-indigo-500" />
                                    Slider Görseli
                                </CardTitle>
                                {formData.imageUrl && (
                                    <Badge variant="outline" className="text-xs font-medium text-emerald-600 border-emerald-200 bg-emerald-50">
                                        Görsel Yüklendi
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {formData.imageUrl && (
                                    <div className="relative aspect-[16/7] w-full rounded-lg overflow-hidden bg-muted border border-border group">
                                        <Image
                                            src={formData.imageUrl}
                                            alt={formData.title || 'Slider preview'}
                                            fill
                                            className="object-cover"
                                            onError={() => {}}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <ImageUpload
                                    value={formData.imageUrl}
                                    onChange={handleImageChange}
                                    onRemove={handleRemoveImage}
                                    pageContext="slider"
                                    label=""
                                    showUrlInput
                                    disabled={loading}
                                />
                            </CardContent>
                        </Card>

                        {/* Title & Subtitle */}
                        <Card className="rounded-xl overflow-hidden p-0">
                            <CardHeader className="p-4 border-b border-border/60 bg-muted/30 flex flex-row items-center gap-2 space-y-0">
                                <Type className="w-5 h-5 text-indigo-500" />
                                <CardTitle className="font-semibold text-foreground text-base">
                                    İçerik Bilgileri
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <Label className="block text-sm font-semibold text-foreground mb-2">
                                            Başlık
                                        </Label>
                                        <Input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="Slider başlığı"
                                        />
                                    </div>
                                    <div>
                                        <Label className="block text-sm font-semibold text-foreground mb-2">
                                            Alt Başlık
                                        </Label>
                                        <Input
                                            type="text"
                                            name="subtitle"
                                            value={formData.subtitle}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="Kısa açıklama metni"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="block text-sm font-semibold text-foreground mb-2">
                                        Açıklama
                                    </Label>
                                    <Textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        className={cn(inputClass, 'resize-none')}
                                        placeholder="Detaylı açıklama metni"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1.5 text-right">
                                        {formData.description.length} karakter
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Button Settings */}
                        <Card className="rounded-xl overflow-hidden p-0">
                            <CardHeader className="p-4 border-b border-border/60 bg-muted/30 flex flex-row items-center gap-2 space-y-0">
                                <MousePointerClick className="w-5 h-5 text-indigo-500" />
                                <CardTitle className="font-semibold text-foreground text-base">
                                    Buton Ayarları
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <Label className="block text-sm font-semibold text-foreground mb-2">
                                            Buton Metni
                                        </Label>
                                        <Input
                                            type="text"
                                            name="buttonText"
                                            value={formData.buttonText}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="Daha Fazla"
                                        />
                                    </div>
                                    <div>
                                        <Label className="block text-sm font-semibold text-foreground mb-2">
                                            Buton Linki
                                        </Label>
                                        <Input
                                            type="text"
                                            name="buttonLink"
                                            value={formData.buttonLink}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="/iletisim"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* === RIGHT COLUMN: Sidebar === */}
                    <div className="space-y-5">

                        {/* Status & Settings */}
                        <Card className="rounded-xl overflow-hidden p-0 xl:sticky xl:top-24 z-10">
                            <CardHeader className="p-4 border-b border-border/60 bg-muted/30 flex flex-row items-center gap-2 space-y-0">
                                <Settings2 className="w-5 h-5 text-indigo-500" />
                                <CardTitle className="font-semibold text-foreground text-base">
                                    Ayarlar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-5">
                                <div>
                                    <Label className="block text-sm font-semibold text-foreground mb-2">Durum</Label>
                                    <select
                                        name="isActive"
                                        value={formData.isActive ? 'true' : 'false'}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option value="true">Aktif</option>
                                        <option value="false">Pasif</option>
                                    </select>
                                    <p className="text-xs text-muted-foreground mt-1.5">
                                        Pasif slider&apos;lar ana sayfada görüntülenmez
                                    </p>
                                </div>

                                <div className="border-t border-border/60 pt-5">
                                    <Label className="block text-sm font-semibold text-foreground mb-2">Badge (Etiket)</Label>
                                    <Input
                                        type="text"
                                        name="badge"
                                        value={formData.badge}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="Yenilik"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1.5">
                                        Slider üzerinde görünecek kısa etiket
                                    </p>
                                </div>

                                <div className="border-t border-border/60 pt-5">
                                    <Label className="block text-sm font-semibold text-foreground mb-2">Sıra (Order)</Label>
                                    <Input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleChange}
                                        className={inputClass}
                                        min={0}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1.5">
                                        Düşük numara önce gösterilir
                                    </p>
                                </div>

                                <div className="border-t border-border/60 pt-5">
                                    <Label className="block text-sm font-semibold text-foreground mb-2">Geçiş Süresi (ms)</Label>
                                    <Input
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        className={inputClass}
                                        min={1000}
                                        step={500}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1.5">
                                        Slider&apos;ın ekranda kalma süresi (1000ms = 1sn)
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </form>
        </div>
    );
}
