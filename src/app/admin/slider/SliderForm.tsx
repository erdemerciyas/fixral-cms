'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const selectInputClass = cn(
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
);

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
        isActive: true, // Boolean as per API
        badge: 'Yenilik',
        duration: 5000,
        imageType: 'url',
        aiProvider: 'unsplash'
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                subtitle: initialData.subtitle || '',
                description: initialData.description || '',
                imageUrl: initialData.imageUrl || initialData.image || '', // Handle legacy/mismatch
                buttonText: initialData.buttonText || 'Daha Fazla',
                buttonLink: initialData.buttonLink || initialData.link || '',
                order: initialData.order || 0,
                isActive: initialData.isActive !== undefined ? initialData.isActive : (initialData.status === 'active'),
                badge: initialData.badge || 'Yenilik',
                duration: initialData.duration || 5000,
                imageType: initialData.imageType || 'url',
                aiProvider: initialData.aiProvider || 'unsplash'
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Handle checkbox/select for boolean
        if (name === 'isActive') {
            const boolValue = (e.target as HTMLSelectElement).value === 'true';
            setFormData(prev => ({ ...prev, [name]: boolValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                alert(data.error || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving slider:', error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        {isEditing ? 'Slider Düzenle' : 'Yeni Slider Ekle'}
                    </h1>
                    <p className="text-muted-foreground">Slider detaylarını yönet</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6 space-y-6">

                    {/* Image Upload / URL Input */}
                    <div>
                        <Label className="block text-sm font-medium text-foreground mb-2">Görsel URL (Zorunlu)</Label>
                        <div className="flex gap-4">
                            <Input
                                type="text"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="flex-1 px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="https://example.com/image.jpg"
                                required
                            />
                        </div>
                        {formData.imageUrl && (
                            <div className="mt-4 relative aspect-video w-full max-w-md rounded-xl overflow-hidden bg-muted border border-border">
                                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label className="block text-sm font-medium text-foreground mb-2">Başlık (Zorunlu)</Label>
                            <Input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <Label className="block text-sm font-medium text-foreground mb-2">Alt Başlık (Subtitle) (Zorunlu)</Label>
                            <Input
                                type="text"
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label className="block text-sm font-medium text-foreground mb-2">Açıklama (Zorunlu)</Label>
                        <Textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label className="block text-sm font-medium text-foreground mb-2">Buton Metni</Label>
                            <Input
                                type="text"
                                name="buttonText"
                                value={formData.buttonText}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <Label className="block text-sm font-medium text-foreground mb-2">Buton Link (Opsiyonel)</Label>
                            <Input
                                type="text"
                                name="buttonLink"
                                value={formData.buttonLink}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="/contact"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label className="block text-sm font-medium text-foreground mb-2">Badge (Etiket)</Label>
                            <Input
                                type="text"
                                name="badge"
                                value={formData.badge}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <Label className="block text-sm font-medium text-foreground mb-2">Süre (ms)</Label>
                            <Input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label className="block text-sm font-medium text-foreground mb-2">Sıra (Order)</Label>
                            <Input
                                type="number"
                                name="order"
                                value={formData.order}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <Label className="block text-sm font-medium text-foreground mb-2">Durum</Label>
                            <select
                                name="isActive"
                                value={formData.isActive ? 'true' : 'false'}
                                onChange={handleChange}
                                className={cn(selectInputClass, 'w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none')}
                            >
                                <option value="true">Aktif</option>
                                <option value="false">Pasif</option>
                            </select>
                        </div>
                    </div>

                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Check className="w-5 h-5" />
                        )}
                        <span>{isEditing ? 'Güncelle' : 'Oluştur'}</span>
                    </Button>
                </div>

            </form>
        </div>
    );
}
