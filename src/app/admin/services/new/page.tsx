'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ImageUpload from '../../../../components/ImageUpload';
import UniversalEditor from '../../../../components/ui/UniversalEditor';
import LanguageTabs from '../../../../components/admin/LanguageTabs';
import { useActiveLanguages } from '../../../../hooks/useActiveLanguages';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Check,
  AlertTriangle,
  FileText,
  ImageIcon,
  ListIcon,
  Wrench,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface TranslationFields {
  title: string;
  description: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
}

export default function NewServicePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [features, setFeatures] = useState<string[]>(['']);
  const [serviceImage, setServiceImage] = useState('');

  // Multilingual
  const { languages, defaultLanguage, loading: langsLoading, error: langsError } = useActiveLanguages();
  const [activeLanguage, setActiveLanguage] = useState('');
  const [translations, setTranslations] = useState<Record<string, TranslationFields>>({});

  // Set default active language and initialize translations
  useEffect(() => {
    if (languages.length === 0) return;
    if (!activeLanguage && defaultLanguage) {
      setActiveLanguage(defaultLanguage.code);
    }
    // Initialize empty translations for all languages
    setTranslations(prev => {
      const init: Record<string, TranslationFields> = {};
      for (const lang of languages) {
        init[lang.code] = prev[lang.code] || {
          title: '',
          description: '',
          excerpt: '',
          metaDescription: '',
          keywords: [],
        };
      }
      return init;
    });
  }, [languages, defaultLanguage, activeLanguage]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const currentTranslation = translations[activeLanguage] || {
    title: '', description: '', excerpt: '', metaDescription: '', keywords: [],
  };

  const updateTranslation = (field: keyof TranslationFields, value: string | string[]) => {
    setTranslations(prev => ({
      ...prev,
      [activeLanguage]: {
        ...prev[activeLanguage],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate default language title
    const defLang = defaultLanguage?.code || activeLanguage;
    const defTrans = translations[defLang];
    if (!defTrans?.title?.trim()) {
      setError('Varsayılan dilde başlık zorunludur');
      setLoading(false);
      return;
    }

    const filteredFeatures = features.filter(feature => feature.trim() !== '');

    try {
      const response = await fetch('/api/public/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: defTrans.title,
          description: defTrans.description || '',
          image: serviceImage || undefined,
          features: filteredFeatures,
          translations,
        }),
      });

      if (!response.ok) {
        throw new Error('Servis eklenirken bir hata oluştu');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/services');
      }, 1500);
    } catch {
      setError('Servis eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  if (status === 'loading' || langsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  // For preview, use default language
  const defCode = defaultLanguage?.code || activeLanguage;
  const previewTitle = translations[defCode]?.title || 'Servis Başlığı';
  const previewDesc = translations[defCode]?.description || '';

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div>
        <p className="text-gray-600">Yeni servis ekleyin</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <Check className="w-5 h-5 shrink-0" />
          <span>Servis başarıyla eklendi! Yönlendiriliyorsunuz...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Language Tabs */}
        {!langsLoading && (
          <LanguageTabs
            languages={languages}
            activeLanguage={activeLanguage}
            onLanguageChange={setActiveLanguage}
            translations={translations}
            error={langsError}
          />
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Temel Bilgiler</h3>
                <p className="text-sm text-gray-500">
                  Servis temel bilgilerini girin
                  {activeLanguage && (
                    <Badge variant="default" className="ml-2">
                      {languages.find(l => l.code === activeLanguage)?.flag} {activeLanguage.toUpperCase()}
                    </Badge>
                  )}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Servis Başlığı *
                </label>
                <input
                  type="text"
                  id="title"
                  value={currentTranslation.title}
                  onChange={(e) => updateTranslation('title', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="Servis başlığı giriniz"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Servis Açıklaması *
                </label>
                <UniversalEditor
                  key={activeLanguage}
                  value={currentTranslation.description}
                  onChange={(val) => updateTranslation('description', val)}
                  placeholder="Servis hakkında detaylı açıklama yazınız"
                  minHeight="200px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kısa Açıklama (Excerpt)
                </label>
                <textarea
                  value={currentTranslation.excerpt}
                  onChange={(e) => updateTranslation('excerpt', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="Kısa açıklama giriniz"
                  rows={2}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Açıklama (SEO)
                </label>
                <textarea
                  value={currentTranslation.metaDescription}
                  onChange={(e) => updateTranslation('metaDescription', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="SEO meta açıklaması"
                  rows={2}
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Image */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Servis Görseli</h3>
                <p className="text-sm text-gray-500">Servis görselini yükleyin</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <ImageUpload
              label="Hizmet Görseli"
              value={serviceImage}
              onChange={(url) => {
                const imageUrl = Array.isArray(url) ? url[0] : url;
                setServiceImage(imageUrl);
              }}
              pageContext="services"
              showUrlInput={true}
              disabled={loading}
            />
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-orange-600 flex items-center justify-center">
                <ListIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Servis Özellikleri</h3>
                <p className="text-sm text-gray-500">Servis özelliklerini ekleyin</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFeature}
            >
              <Plus className="w-4 h-4" />
              <span>Özellik Ekle</span>
            </Button>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {features.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">
                  Henüz özellik eklenmedi. Yukarıdaki butonu kullanarak özellik ekleyebilirsiniz.
                </p>
              ) : (
                features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      placeholder="Özellik açıklaması"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-teal-600 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Önizleme</h3>
                <p className="text-sm text-gray-500">Servis önizlemesi</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="bg-surface-secondary rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{previewTitle}</h4>
                  <div className="text-gray-600 text-sm mb-4">
                    {previewDesc ? (
                      <div dangerouslySetInnerHTML={{ __html: previewDesc.substring(0, 150) + (previewDesc.length > 150 ? '...' : '') }} />
                    ) : (
                      <p>Servis açıklaması buraya gelecek...</p>
                    )}
                  </div>

                  {features.filter(f => f.trim()).length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Özellikler:</h5>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {features.filter(f => f.trim()).map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <div className="w-full h-32 bg-surface-tertiary rounded-xl overflow-hidden flex items-center justify-center relative">
                    {serviceImage ? (
                      <Image
                        src={serviceImage}
                        alt="Service preview"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Görsel yüklenmemiş</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-between pt-6">
          <Link
            href="/admin/services"
            className="flex items-center space-x-2 px-6 py-3 border border-border rounded-xl text-gray-700 hover:bg-surface-secondary transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri Dön</span>
          </Link>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="px-8 font-semibold"
          >
            {loading ? (
              <span>Ekleniyor...</span>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Servis Ekle</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
