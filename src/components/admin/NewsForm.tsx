'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { NewsItem, AIMetadataGenerationResponse, NewsTranslation } from '@/types/news';
import { logger } from '@/core/lib/logger';
import { useActiveLanguages } from '@/hooks/useActiveLanguages';
import LanguageTabs from '@/components/admin/LanguageTabs';
import ImageUpload from '@/components/ImageUpload';
import {
  Sparkles as SparklesIcon,
  Check as CheckIcon,
  X as XMarkIcon,
  Image as PhotoIcon,
  Tag as TagIcon,
  FileText as FileTextIcon,
  Settings2 as SettingsIcon,
  AlertTriangle as AlertIcon,
  Save as SaveIcon,
  ArrowLeft as ArrowLeftIcon,
  Trash2 as TrashIcon,
  ChevronDown,
  ChevronUp,
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

interface NewsFormProps {
  initialData?: NewsItem;
  onSubmit?: (data: NewsItem) => Promise<void>;
  isLoading?: boolean;
}

interface ValidationErrors {
  title?: string;
  content?: string;
  featuredImage?: string;
}

const emptyTranslation = (): NewsTranslation => ({
  title: '',
  content: '',
  excerpt: '',
  metaDescription: '',
  keywords: [],
});

export default function NewsForm({ initialData, onSubmit, isLoading = false }: NewsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(isLoading);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<string>('');
  const [generatingMetadata, setGeneratingMetadata] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [seoExpanded, setSeoExpanded] = useState(false);

  const { languages, defaultLanguage, loading: langsLoading, error: langsError } = useActiveLanguages();

  const buildInitialTranslations = useCallback(() => {
    const translations: Record<string, NewsTranslation> = {};
    if (languages.length > 0) {
      languages.forEach((lang) => {
        const existing = initialData?.translations?.[lang.code];
        translations[lang.code] = existing
          ? { ...emptyTranslation(), ...existing }
          : emptyTranslation();
      });
    }
    return translations;
  }, [languages, initialData]);

  const [formData, setFormData] = useState({
    translations: {} as Record<string, NewsTranslation>,
    featuredImage: {
      url: initialData?.featuredImage?.url || '',
      altText: initialData?.featuredImage?.altText || '',
      cloudinaryPublicId: initialData?.featuredImage?.cloudinaryPublicId || '',
    },
    tags: initialData?.tags || [],
    relatedPortfolioIds: initialData?.relatedPortfolioIds || [],
    relatedNewsIds: initialData?.relatedNewsIds || [],
    status: (initialData?.status || 'draft') as 'draft' | 'published',
  });

  const initialFormDataRef = useRef<string | null>(null);

  useEffect(() => {
    if (languages.length > 0 && Object.keys(formData.translations).length === 0) {
      const initialTranslations = buildInitialTranslations();
      setFormData((prev) => {
        const newData = { ...prev, translations: initialTranslations };
        if (initialFormDataRef.current === null) {
          initialFormDataRef.current = JSON.stringify(newData);
        }
        return newData;
      });
      if (!activeLanguage && defaultLanguage) {
        setActiveLanguage(defaultLanguage.code);
      }
    }
  }, [languages, defaultLanguage, buildInitialTranslations, activeLanguage, formData.translations]);

  const isDirty = useMemo(() => {
    if (initialFormDataRef.current === null) return false;
    return JSON.stringify(formData) !== initialFormDataRef.current;
  }, [formData]);

  // Unsaved changes protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !loading) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, loading]);

  const handleLanguageChange = useCallback(
    (newLang: string) => {
      if (newLang === activeLanguage) return;
      setActiveLanguage(newLang);
    },
    [activeLanguage]
  );

  const handleContentChange = useCallback(
    (html: string) => {
      if (!activeLanguage) return;
      setFormData((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          [activeLanguage]: {
            ...prev.translations[activeLanguage],
            content: html,
          },
        },
      }));
    },
    [activeLanguage]
  );

  const handleFeaturedImageChange = useCallback((url: string | string[]) => {
    const imageUrl = Array.isArray(url) ? url[0] : url;
    setFormData((prev) => ({
      ...prev,
      featuredImage: {
        ...prev.featuredImage,
        url: imageUrl,
      },
    }));
  }, []);

  const handleRemoveFeaturedImage = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      featuredImage: { url: '', altText: '', cloudinaryPublicId: '' },
    }));
  }, []);

  const handleGenerateMetadata = useCallback(async () => {
    try {
      setGeneratingMetadata(true);
      setError(null);

      const content = formData.translations[activeLanguage]?.content;
      if (!content || content.length < 100) {
        setError('Metadata oluşturmak için içerik en az 100 karakter olmalıdır');
        return;
      }

      const response = await fetch('/api/public/ai/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, language: activeLanguage }),
      });

      if (!response.ok) throw new Error('Metadata oluşturulamadı');

      const { data: metadata } = (await response.json()) as { data: AIMetadataGenerationResponse };

      setFormData((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          [activeLanguage]: {
            ...prev.translations[activeLanguage],
            title: metadata.title,
            metaDescription: metadata.metaDescription,
            excerpt: metadata.excerpt,
            keywords: metadata.keywords,
          },
        },
      }));

      setSuccess('Metadata başarıyla oluşturuldu');
      setSeoExpanded(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      logger.error('Error generating metadata', 'NEWS_FORM', { error: errorMessage });
      setError(errorMessage);
    } finally {
      setGeneratingMetadata(false);
    }
  }, [formData.translations, activeLanguage]);

  const validate = useCallback((): boolean => {
    const errors: ValidationErrors = {};
    const trans = formData.translations[activeLanguage];

    if (!trans?.title?.trim()) {
      errors.title = 'Başlık zorunludur';
    }

    const hasAnyTitle = Object.values(formData.translations).some(
      (t) => t.title?.trim()
    );
    if (!hasAnyTitle) {
      errors.title = 'En az bir dilde başlık girilmelidir';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.translations, activeLanguage]);

  useEffect(() => {
    if (hasAttemptedSubmit) {
      validate();
    }
  }, [formData.translations, activeLanguage, hasAttemptedSubmit, validate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    if (!validate()) {
      setError('Lütfen zorunlu alanları doldurun');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const translations: Record<string, NewsTranslation> = {};
      for (const [code, trans] of Object.entries(formData.translations)) {
        if (trans.title || trans.content) {
          translations[code] = trans;
        }
      }

      const cleanedData = {
        ...formData,
        translations,
      };

      const url = initialData ? `/api/admin/news/${initialData._id}` : '/api/admin/news';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Haber kaydedilemedi');
      }

      const { data: savedNews } = await response.json();

      initialFormDataRef.current = JSON.stringify(formData);

      if (onSubmit) {
        await onSubmit(savedNews);
      }

      setSuccess(initialData ? 'Haber başarıyla güncellendi' : 'Haber başarıyla oluşturuldu');
      setTimeout(() => {
        router.push('/admin/news');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      logger.error('Error saving news article', 'NEWS_FORM', { error: errorMessage });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm('Kaydedilmemiş değişiklikler var. Çıkmak istediğinize emin misiniz?');
      if (!confirmed) return;
    }
    router.back();
  }, [isDirty, router]);

  if (langsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
        <span className="ml-3 text-slate-600 dark:text-slate-400">Diller yükleniyor...</span>
      </div>
    );
  }

  const translation = formData.translations[activeLanguage] || emptyTranslation();

  const inputBase =
    'w-full px-4 py-2.5 border bg-transparent text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm';
  const inputNormal = `${inputBase} border-slate-200 dark:border-slate-700 dark:bg-slate-900`;
  const inputError = `${inputBase} border-red-400 dark:border-red-500 ring-1 ring-red-400`;

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Hata</p>
            <p className="text-sm mt-0.5 opacity-90">{error}</p>
          </div>
          <button type="button" onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-800/30 rounded-lg transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
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
          onLanguageChange={handleLanguageChange}
          translations={formData.translations}
          error={langsError}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* === LEFT COLUMN: Main content === */}
        <div className="space-y-6 min-w-0">
          {/* Title */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700 p-5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Başlık <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={translation.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    [activeLanguage]: {
                      ...prev.translations[activeLanguage],
                      title: e.target.value,
                    },
                  },
                }))
              }
              placeholder="Makale başlığını girin"
              maxLength={200}
              className={validationErrors.title && hasAttemptedSubmit ? inputError : inputNormal}
            />
            <div className="flex items-center justify-between mt-1.5">
              {validationErrors.title && hasAttemptedSubmit ? (
                <p className="text-xs text-red-500 font-medium">{validationErrors.title}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-slate-400">{translation.title.length}/200</p>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                İçerik
              </label>
            </div>
            <ModernEditor
              content={translation.content}
              onChange={handleContentChange}
              placeholder="Haber içeriğini yazın..."
              minHeight="400px"
              maxHeight="800px"
              allowImages
              allowTables
              allowCodeBlocks
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700 p-5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Özet
            </label>
            <textarea
              value={translation.excerpt}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    [activeLanguage]: {
                      ...prev.translations[activeLanguage],
                      excerpt: e.target.value,
                    },
                  },
                }))
              }
              placeholder="Makalenin kısa özeti"
              maxLength={300}
              rows={3}
              className={`${inputNormal} resize-none`}
            />
            <p className="text-xs text-slate-400 mt-1.5 text-right">{translation.excerpt.length}/300</p>
          </div>
        </div>

        {/* === RIGHT COLUMN: Sidebar === */}
        <div className="space-y-5">
          {/* Action Buttons - sticky at top */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700 p-4 xl:sticky xl:top-24 z-10">
            <div className="flex flex-col gap-2.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <SaveIcon className="w-4 h-4" />
                    {initialData ? 'Güncelle' : 'Yayınla'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full px-5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                İptal
              </button>
            </div>
            {isDirty && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2.5 text-center font-medium flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                Kaydedilmemiş değişiklikler
              </p>
            )}
          </div>

          {/* Status */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <SettingsIcon className="w-4 h-4 text-slate-500" />
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Durum</label>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, status: 'draft' }))}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.status === 'draft'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-700'
                    : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
              >
                Taslak
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, status: 'published' }))}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.status === 'published'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-700'
                    : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
              >
                Yayınla
              </button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <PhotoIcon className="w-4 h-4 text-slate-500" />
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Öne Çıkan Resim</label>
            </div>

            {formData.featuredImage.url ? (
              <div className="mb-3">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 group">
                  <Image
                    src={formData.featuredImage.url}
                    alt={formData.featuredImage.altText}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleRemoveFeaturedImage}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      title="Resmi Kaldır"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <ImageUpload
              value={formData.featuredImage.url}
              onChange={handleFeaturedImageChange}
              onRemove={handleRemoveFeaturedImage}
              pageContext="news"
              label=""
              showUrlInput
            />

            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Alt Metin (SEO)
              </label>
              <input
                type="text"
                placeholder="Resim açıklaması"
                value={formData.featuredImage.altText}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    featuredImage: {
                      ...prev.featuredImage,
                      altText: e.target.value,
                    },
                  }))
                }
                className={`${inputNormal} text-xs`}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TagIcon className="w-4 h-4 text-slate-500" />
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Etiketler</label>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-600"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          tags: prev.tags.filter((_, i) => i !== index),
                        }))
                      }
                      className="hover:text-red-500 transition-colors ml-0.5"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              type="text"
              placeholder="Etiket yazıp Enter'a basın"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const tag = e.currentTarget.value.trim();
                  if (tag && !formData.tags.includes(tag)) {
                    setFormData((prev) => ({
                      ...prev,
                      tags: [...prev.tags, tag],
                    }));
                    e.currentTarget.value = '';
                  }
                }
              }}
              className={`${inputNormal} text-xs`}
            />
          </div>

          {/* SEO Section - Collapsible */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700 overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoExpanded(!seoExpanded)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">SEO Metadata</span>
              </div>
              {seoExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {seoExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                <button
                  type="button"
                  onClick={handleGenerateMetadata}
                  disabled={generatingMetadata || loading}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <SparklesIcon className="w-4 h-4" />
                  {generatingMetadata ? 'Oluşturuluyor...' : 'AI ile Oluştur'}
                </button>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Meta Açıklaması
                  </label>
                  <textarea
                    value={translation.metaDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        translations: {
                          ...prev.translations,
                          [activeLanguage]: {
                            ...prev.translations[activeLanguage],
                            metaDescription: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="SEO meta açıklaması"
                    maxLength={160}
                    rows={2}
                    className={`${inputNormal} text-xs resize-none`}
                  />
                  <p className="text-[11px] text-slate-400 mt-1 text-right">{translation.metaDescription.length}/160</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Anahtar Kelimeler
                  </label>
                  {translation.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {translation.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-medium border border-indigo-200 dark:border-indigo-700"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                translations: {
                                  ...prev.translations,
                                  [activeLanguage]: {
                                    ...prev.translations[activeLanguage],
                                    keywords: translation.keywords.filter((_, i) => i !== index),
                                  },
                                },
                              }))
                            }
                            className="hover:text-red-500 transition-colors"
                          >
                            <XMarkIcon className="w-3 h-3" />
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
                        const keyword = e.currentTarget.value.trim();
                        if (keyword && translation.keywords.length < 10) {
                          setFormData((prev) => ({
                            ...prev,
                            translations: {
                              ...prev.translations,
                              [activeLanguage]: {
                                ...prev.translations[activeLanguage],
                                keywords: [...translation.keywords, keyword],
                              },
                            },
                          }));
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                    className={`${inputNormal} text-xs`}
                  />
                  <p className="text-[11px] text-slate-400 mt-1 text-right">{translation.keywords.length}/10</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
