'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import ImageUpload from '@/components/ImageUpload';
import LanguageTabs from '@/components/admin/LanguageTabs';
import { useActiveLanguages } from '@/hooks/useActiveLanguages';
import {
  Check,
  Plus,
  Trash2,
  ListIcon,
  AlertTriangle,
  Save,
  ArrowLeft,
  X,
  Image as PhotoIcon,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Eye,
} from 'lucide-react';

const ModernEditor = dynamic(() => import('@/components/admin/ModernEditor'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-t-lg mb-2" />
      <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-b-lg" />
    </div>
  ),
});

interface TranslationFields {
  title: string;
  description: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
}

interface Service {
  _id: string;
  title: string;
  description: string;
  image: string;
  features?: string[];
  translations?: Record<string, Partial<TranslationFields>>;
}

const emptyTranslation = (): TranslationFields => ({
  title: '',
  description: '',
  excerpt: '',
  metaDescription: '',
  keywords: [],
});

export default function EditServicePage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [features, setFeatures] = useState<string[]>(['']);
  const [serviceImage, setServiceImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [seoExpanded, setSeoExpanded] = useState(false);

  const { languages, defaultLanguage, loading: langsLoading, error: langsError } = useActiveLanguages();
  const [activeLanguage, setActiveLanguage] = useState('');
  const [translations, setTranslations] = useState<Record<string, TranslationFields>>({});
  const translationsInitialized = useRef(false);
  const initialFormRef = useRef<string | null>(null);

  useEffect(() => {
    if (defaultLanguage && !activeLanguage) {
      setActiveLanguage(defaultLanguage.code);
    }
  }, [defaultLanguage, activeLanguage]);

  useEffect(() => {
    if (!service?._id || languages.length === 0 || translationsInitialized.current) return;

    const initTranslations: Record<string, TranslationFields> = {};
    const existingTranslations = service.translations || {};

    for (const lang of languages) {
      const existing = existingTranslations[lang.code];
      if (existing) {
        initTranslations[lang.code] = {
          title: existing.title || '',
          description: existing.description || '',
          excerpt: existing.excerpt || '',
          metaDescription: existing.metaDescription || '',
          keywords: existing.keywords || [],
        };
      } else if (lang.isDefault) {
        initTranslations[lang.code] = {
          title: service.title || '',
          description: service.description || '',
          excerpt: '',
          metaDescription: '',
          keywords: [],
        };
      } else {
        initTranslations[lang.code] = emptyTranslation();
      }
    }

    setTranslations(initTranslations);
    translationsInitialized.current = true;
    initialFormRef.current = JSON.stringify({ translations: initTranslations, features, serviceImage });
  }, [service, languages, features, serviceImage]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/admin/services/${params.id}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || 'Servis yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        setService(data);
        setServiceImage(data.image || '');
        setFeatures(data.features && data.features.length > 0 ? data.features : ['']);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Servis bilgileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [params.id]);

  const isDirty = useMemo(() => {
    if (!initialFormRef.current) return false;
    return JSON.stringify({ translations, features, serviceImage }) !== initialFormRef.current;
  }, [translations, features, serviceImage]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !saving) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saving]);

  const currentTranslation = translations[activeLanguage] || emptyTranslation();

  const updateTranslation = useCallback((field: keyof TranslationFields, value: string | string[]) => {
    setTranslations(prev => ({
      ...prev,
      [activeLanguage]: {
        ...prev[activeLanguage],
        [field]: value,
      },
    }));
  }, [activeLanguage]);

  const handleContentChange = useCallback((html: string) => {
    if (!activeLanguage) return;
    setTranslations(prev => ({
      ...prev,
      [activeLanguage]: {
        ...prev[activeLanguage],
        description: html,
      },
    }));
  }, [activeLanguage]);

  const addFeature = () => setFeatures(prev => [...prev, '']);

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateFeature = (index: number, value: string) => {
    setFeatures(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const defLang = defaultLanguage?.code || activeLanguage;
    const defTrans = translations[defLang];
    if (!defTrans?.title?.trim()) {
      setError('Varsayılan dilde başlık zorunludur');
      setSaving(false);
      return;
    }

    const filteredFeatures = features.filter(f => f.trim() !== '');

    try {
      const response = await fetch(`/api/admin/services/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: defTrans.title,
          description: defTrans.description || '',
          image: serviceImage || '',
          features: filteredFeatures,
          translations,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Servis güncellenirken bir hata oluştu');
      }

      initialFormRef.current = JSON.stringify({ translations, features, serviceImage });
      setSuccess('Servis başarıyla güncellendi');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Servis güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (isDirty) {
      if (!window.confirm('Kaydedilmemiş değişiklikler var. Çıkmak istediğinize emin misiniz?')) return;
    }
    router.push('/admin/services');
  }, [isDirty, router]);

  const inputBase =
    'w-full px-4 py-2.5 border bg-transparent text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm';
  const inputNormal = `${inputBase} border-border`;

  if (status === 'loading' || loading || langsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-border rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!session?.user || !service) return null;

  const translation = translations[activeLanguage] || emptyTranslation();

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Hata</p>
            <p className="text-sm mt-0.5 opacity-90">{error}</p>
          </div>
          <button type="button" onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-800/30 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Başarılı</p>
            <p className="text-sm mt-0.5 opacity-90">{success}</p>
          </div>
        </div>
      )}

      {/* Language Tabs */}
      <div className="mb-6">
        <LanguageTabs
          languages={languages}
          activeLanguage={activeLanguage}
          onLanguageChange={setActiveLanguage}
          translations={translations}
          error={langsError}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6 min-w-0">
          {/* Title */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-5">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Servis Başlığı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={translation.title}
              onChange={(e) => updateTranslation('title', e.target.value)}
              placeholder="Servis başlığı giriniz"
              maxLength={200}
              className={inputNormal}
              disabled={saving}
            />
            <div className="flex items-center justify-between mt-1.5">
              <span />
              <p className="text-xs text-muted-foreground">{translation.title.length}/200</p>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-foreground">
                Servis Açıklaması
              </label>
            </div>
            <ModernEditor
              key={activeLanguage}
              content={translation.description}
              onChange={handleContentChange}
              placeholder="Servis hakkında detaylı açıklama yazınız..."
              minHeight="300px"
              maxHeight="700px"
              allowImages
              allowTables
              allowCodeBlocks
            />
          </div>

          {/* Excerpt */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-5">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Kısa Açıklama (Excerpt)
            </label>
            <textarea
              value={translation.excerpt}
              onChange={(e) => updateTranslation('excerpt', e.target.value)}
              placeholder="Listeleme sayfalarında görünecek kısa açıklama"
              maxLength={300}
              rows={3}
              className={`${inputNormal} resize-none`}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground mt-1.5 text-right">{translation.excerpt.length}/300</p>
          </div>

          {/* Features */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListIcon className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-semibold text-foreground">Servis Özellikleri</label>
              </div>
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Özellik Ekle
              </button>
            </div>

            <div className="space-y-2.5">
              {features.length === 0 ? (
                <p className="text-muted-foreground text-sm py-6 text-center">
                  Henüz özellik eklenmedi.
                </p>
              ) : (
                features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <span className="text-xs text-muted-foreground w-6 text-center font-medium">{index + 1}</span>
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className={`${inputNormal} flex-1`}
                      placeholder="Özellik açıklaması"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="space-y-5">
          {/* Action Buttons */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-4 xl:sticky xl:top-24 z-10">
            <div className="flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={saving}
                className="w-full px-5 py-2.5 bg-primary hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Güncelleniyor...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Servisi Güncelle
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full px-5 py-2.5 border border-border rounded-xl hover:bg-muted transition-all font-medium text-sm text-muted-foreground flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Geri Dön
              </button>
            </div>
            {isDirty && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2.5 text-center font-medium flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                Kaydedilmemiş değişiklikler
              </p>
            )}
          </div>

          {/* Service Image */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <PhotoIcon className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-semibold text-foreground">Hizmet Görseli</label>
            </div>

            {serviceImage && (
              <div className="mb-3">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted group">
                  <Image
                    src={serviceImage}
                    alt="Servis görseli"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setServiceImage('')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      title="Görseli Kaldır"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <ImageUpload
              label=""
              value={serviceImage}
              onChange={(url) => {
                const imageUrl = Array.isArray(url) ? url[0] : url;
                setServiceImage(imageUrl);
              }}
              pageContext="services"
              showUrlInput={true}
              disabled={saving}
            />
          </div>

          {/* SEO Section - Collapsible */}
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoExpanded(!seoExpanded)}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">SEO Metadata</span>
              </div>
              {seoExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {seoExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Meta Açıklaması
                  </label>
                  <textarea
                    value={translation.metaDescription}
                    onChange={(e) => updateTranslation('metaDescription', e.target.value)}
                    placeholder="SEO meta açıklaması"
                    maxLength={160}
                    rows={2}
                    className={`${inputNormal} text-xs resize-none`}
                    disabled={saving}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1 text-right">{translation.metaDescription.length}/160</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Anahtar Kelimeler
                  </label>
                  {translation.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {translation.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...translation.keywords];
                              next.splice(index, 1);
                              updateTranslation('keywords', next);
                            }}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Anahtar kelime + Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const kw = e.currentTarget.value.trim();
                        if (kw && translation.keywords.length < 10) {
                          updateTranslation('keywords', [...translation.keywords, kw]);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                    className={`${inputNormal} text-xs`}
                    disabled={saving}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1 text-right">{translation.keywords.length}/10</p>
                </div>
              </div>
            )}
          </div>

          {/* Preview Card */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-semibold text-foreground">Önizleme</label>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold text-foreground text-sm mb-1.5 line-clamp-2">
                {translation.title || 'Servis Başlığı'}
              </h4>
              {translation.excerpt ? (
                <p className="text-xs text-muted-foreground line-clamp-3">{translation.excerpt}</p>
              ) : translation.description ? (
                <div
                  className="text-xs text-muted-foreground line-clamp-3"
                  dangerouslySetInnerHTML={{
                    __html: translation.description.replace(/<[^>]+>/g, '').substring(0, 150) + '...',
                  }}
                />
              ) : (
                <p className="text-xs text-muted-foreground italic">Açıklama girilmemiş</p>
              )}
              {features.filter(f => f.trim()).length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-[11px] font-medium text-muted-foreground mb-1">Özellikler:</p>
                  <ul className="space-y-0.5">
                    {features.filter(f => f.trim()).slice(0, 3).map((f, i) => (
                      <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <span className="w-1 h-1 bg-primary rounded-full" />
                        {f}
                      </li>
                    ))}
                    {features.filter(f => f.trim()).length > 3 && (
                      <li className="text-[11px] text-muted-foreground italic">
                        +{features.filter(f => f.trim()).length - 3} daha...
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
