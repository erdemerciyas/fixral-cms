'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import UniversalEditor from '../ui/UniversalEditor';
import PortfolioImageGallery from '../PortfolioImageGallery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tag,
  Check,
  X,
  Hash,
  Image as ImageIcon,
  AlertTriangle,
  Trash2,
  ArrowLeft,
  Pencil,
  Box,
  Download,
  Calendar,
  User,
  Plus,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Category } from '@/types/portfolio';
import slugify from 'slugify';
import { useToast } from '../ui/useToast';
import { useConfirm } from '@/hooks/use-confirm';
import { useActiveLanguages } from '@/hooks/useActiveLanguages';
import LanguageTabs from '@/components/admin/LanguageTabs';

interface TranslationFields {
  title: string;
  description: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
}

const emptyTranslation = (): TranslationFields => ({
  title: '',
  description: '',
  excerpt: '',
  metaDescription: '',
  keywords: [],
});

export interface PortfolioFormData {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  categoryIds: string[];
  client: string;
  completionDate: string;
  technologies: string[];
  coverImage: string;
  images: string[];
  models3D: Array<{
    url: string;
    name: string;
    format: string;
    size: number;
    downloadable: boolean;
    publicId: string;
    uploadedAt: string;
    _id?: string;
  }>;
  featured: boolean;
  order: number;
  projectUrl: string;
  githubUrl: string;
  translations?: Record<string, TranslationFields>;
}

interface PortfolioFormProps {
  mode: 'create' | 'edit';
  initialData?: PortfolioFormData;
  onSubmit: (data: PortfolioFormData) => Promise<void>;
  submitting: boolean;
}

const defaultFormData: PortfolioFormData = {
  title: '',
  slug: '',
  description: '',
  categoryIds: [],
  client: '',
  completionDate: '',
  technologies: [],
  coverImage: '',
  images: [],
  models3D: [],
  featured: false,
  order: 0,
  projectUrl: '',
  githubUrl: '',
};

export default function PortfolioForm({
  mode,
  initialData,
  onSubmit,
  submitting,
}: PortfolioFormProps) {
  const { show: showToast } = useToast();
  const { confirm } = useConfirm();
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [slugLocked, setSlugLocked] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploadingModel, setUploadingModel] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const isDirtyRef = useRef(false);
  const [techInput, setTechInput] = useState('');

  const { languages, defaultLanguage, loading: langsLoading, error: langsError } = useActiveLanguages();
  const [activeLanguage, setActiveLanguage] = useState<string>('');
  const [translations, setTranslations] = useState<Record<string, TranslationFields>>({});
  const [translationsInitialized, setTranslationsInitialized] = useState(false);

  const [formData, setFormData] = useState<PortfolioFormData>(
    initialData || defaultFormData
  );

  // Unsaved changes warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current && !submitting) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [submitting]);

  const markDirty = useCallback(() => {
    isDirtyRef.current = true;
  }, []);

  // Sync initialData when it arrives (edit mode)
  useEffect(() => {
    if (initialData && initialData._id) {
      setFormData(initialData);
    }
  }, [initialData]);

  const currentTranslation = translations[activeLanguage] || emptyTranslation();

  // Initialize translations
  useEffect(() => {
    if (languages.length === 0 || translationsInitialized) return;

    if (mode === 'create') {
      const initTrans: Record<string, TranslationFields> = {};
      languages.forEach((lang) => {
        initTrans[lang.code] = emptyTranslation();
      });
      setTranslations(initTrans);
      setTranslationsInitialized(true);
      if (!activeLanguage && defaultLanguage) {
        setActiveLanguage(defaultLanguage.code);
      }
    } else if (mode === 'edit' && formData._id) {
      const initTrans: Record<string, TranslationFields> = {};
      const existingTrans = (formData as any).translations || {};
      languages.forEach((lang) => {
        const existing = existingTrans[lang.code];
        initTrans[lang.code] = existing
          ? { ...emptyTranslation(), ...existing }
          : emptyTranslation();
      });
      if (defaultLanguage && formData.title && !existingTrans[defaultLanguage.code]?.title) {
        initTrans[defaultLanguage.code] = {
          ...initTrans[defaultLanguage.code],
          title: formData.title || '',
          description: formData.description || '',
        };
      }
      setTranslations(initTrans);
      setTranslationsInitialized(true);
      if (!activeLanguage && defaultLanguage) {
        setActiveLanguage(defaultLanguage.code);
      }
    }
  }, [languages, defaultLanguage, formData._id, translationsInitialized, mode, activeLanguage, formData.title, formData.description]);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/public/categories');
      if (!response.ok) throw new Error('Kategoriler getirilemedi');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Kategoriler yüklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Real-time field validation on blur
  const validateField = useCallback((field: string) => {
    const defLangCode = defaultLanguage?.code || activeLanguage;
    const defTrans = translations[defLangCode] || emptyTranslation();

    const errs = { ...fieldErrors };

    switch (field) {
      case 'title':
        if (!defTrans.title.trim() && (mode === 'create' || !formData.title.trim())) {
          errs.title = 'Proje başlığı zorunludur';
        } else {
          delete errs.title;
        }
        break;
      case 'client':
        if (!formData.client.trim()) {
          errs.client = 'Müşteri/Şirket zorunludur';
        } else {
          delete errs.client;
        }
        break;
      case 'completionDate':
        if (!formData.completionDate) {
          errs.completionDate = 'Tamamlanma tarihi zorunludur';
        } else {
          delete errs.completionDate;
        }
        break;
      case 'description':
        if (!defTrans.description.trim() && (mode === 'create' || !formData.description.trim())) {
          errs.description = 'Proje açıklaması zorunludur';
        } else {
          delete errs.description;
        }
        break;
      case 'categoryIds':
        if (formData.categoryIds.length === 0) {
          errs.categoryIds = 'En az bir kategori seçmelisiniz';
        } else {
          delete errs.categoryIds;
        }
        break;
      case 'images':
        if (formData.images.length === 0) {
          errs.images = 'En az bir proje görseli yüklemelisiniz';
        } else {
          delete errs.images;
        }
        if (!formData.coverImage) {
          errs.coverImage = 'Kapak görseli seçmelisiniz';
        } else {
          delete errs.coverImage;
        }
        break;
    }
    setFieldErrors(errs);
  }, [defaultLanguage, activeLanguage, translations, formData, fieldErrors, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const defLangCode = defaultLanguage?.code || activeLanguage;
    const defTrans = translations[defLangCode] || emptyTranslation();

    const errs: Record<string, string> = {};
    if (!defTrans.title.trim() && (mode === 'create' || !formData.title.trim())) errs.title = 'Proje başlığı zorunludur';
    if (!formData.slug.trim() && !defTrans.title.trim()) errs.slug = 'URL slug zorunludur';
    if (!formData.client.trim()) errs.client = 'Müşteri/Şirket zorunludur';
    if (!formData.completionDate) errs.completionDate = 'Tamamlanma tarihi zorunludur';
    if (!defTrans.description.trim() && (mode === 'create' || !formData.description.trim())) errs.description = 'Proje açıklaması zorunludur';
    if (formData.categoryIds.length === 0) errs.categoryIds = 'En az bir kategori seçmelisiniz';
    if (formData.images.length === 0) errs.images = 'En az bir proje görseli yüklemelisiniz';
    if (!formData.coverImage) errs.coverImage = 'Kapak görseli seçmelisiniz';

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      const firstErr = Object.values(errs)[0];
      setError(firstErr);
      showToast({ variant: 'danger', title: 'Form hatası', description: firstErr });
      return;
    }

    const filteredTranslations: Record<string, TranslationFields> = {};
    for (const [code, trans] of Object.entries(translations)) {
      if (trans.title || trans.description) {
        filteredTranslations[code] = trans;
      }
    }

    const cleanedData: PortfolioFormData = {
      ...formData,
      title: defTrans.title || formData.title,
      description: defTrans.description || formData.description,
      translations: filteredTranslations,
      technologies: formData.technologies.filter(tech => tech.trim() !== ''),
      images: formData.images.filter(img => img.trim() !== ''),
    };

    try {
      await onSubmit(cleanedData);
      isDirtyRef.current = false;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(msg);
      showToast({ variant: 'danger', title: 'İşlem başarısız', description: msg });
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    markDirty();
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
  };

  const addTechnology = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (formData.technologies.includes(trimmed)) return;
    markDirty();
    setFormData(prev => ({
      ...prev,
      technologies: [...prev.technologies, trimmed],
    }));
    setTechInput('');
  };

  const removeTechnology = (index: number) => {
    markDirty();
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index),
    }));
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechnology(techInput);
    } else if (e.key === 'Backspace' && !techInput && formData.technologies.length > 0) {
      removeTechnology(formData.technologies.length - 1);
    }
  };

  const handleImagesChange = (images: string[]) => {
    markDirty();
    setFormData(prev => ({ ...prev, images }));
  };

  const handleCoverImageChange = (coverImage: string) => {
    markDirty();
    setFormData(prev => ({ ...prev, coverImage }));
  };

  const handle3DModelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedFormats = ['stl', 'obj', 'gltf', 'glb'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedFormats.includes(fileExtension)) {
      setError('Desteklenmeyen dosya formatı. Sadece STL, OBJ, GLTF, GLB dosyaları kabul edilir.');
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Dosya boyutu 50MB\'dan büyük olamaz');
      return;
    }

    setUploadingModel(true);
    setError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/public/3dmodels/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Yükleme başarısız');
      }

      const result = await response.json();
      markDirty();

      setFormData(prev => ({
        ...prev,
        models3D: [...prev.models3D, {
          url: result.data.url,
          name: result.data.name,
          format: result.data.format,
          size: result.data.size,
          downloadable: false,
          publicId: result.data.publicId,
          uploadedAt: new Date().toISOString(),
        }]
      }));

      showToast({ variant: 'success', title: 'Başarılı', description: '3D model başarıyla yüklendi' });
      event.target.value = '';
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Yükleme sırasında bir hata oluştu';
      setError(msg);
      showToast({ variant: 'danger', title: 'Yükleme hatası', description: msg });
    } finally {
      setUploadingModel(false);
    }
  };

  const remove3DModel = async (index: number) => {
    const model = formData.models3D[index];

    const confirmed = await confirm({
      title: '3D Modeli Sil',
      description: `"${model.name}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
      confirmText: 'Evet, Sil',
      cancelText: 'Vazgeç',
      variant: 'destructive',
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/public/3dmodels/delete?publicId=${encodeURIComponent(model.publicId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Silme işlemi başarısız oldu');
      markDirty();

      setFormData(prev => ({
        ...prev,
        models3D: prev.models3D.filter((_, i) => i !== index)
      }));

      showToast({ variant: 'success', title: 'Başarılı', description: '3D model silindi' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Silme sırasında bir hata oluştu';
      setError(msg);
      showToast({ variant: 'danger', title: 'Silme hatası', description: msg });
    }
  };

  const toggle3DModelDownloadable = (index: number) => {
    markDirty();
    setFormData(prev => ({
      ...prev,
      models3D: prev.models3D.map((model, i) =>
        i === index ? { ...model, downloadable: !model.downloadable } : model
      )
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 z-20 bg-surface-secondary/80 backdrop-blur-sm py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/portfolio"
            className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-border"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {mode === 'create' ? 'Yeni Proje' : 'Projeyi Düzenle'}
            </h1>
            <p className="text-sm text-gray-500">
              {mode === 'create'
                ? 'Portfolyonuza yeni bir eser ekleyin'
                : formData.title || 'Proje düzenleniyor...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/portfolio"
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            İptal
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            size="lg"
            className="rounded-xl font-semibold"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {mode === 'create' ? 'Kaydediliyor...' : 'Güncelleniyor...'}
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                {mode === 'create' ? 'Projeyi Yayınla' : 'Değişiklikleri Kaydet'}
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="font-medium">{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Visual Media (40%) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Image Gallery */}
          <Card className="rounded-xl overflow-hidden p-0">
            <CardHeader className="p-4 border-b border-border-subtle bg-surface-secondary/50 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-brand-500" />
                Medya Galeri
              </CardTitle>
              <Badge variant="outline" className="text-xs font-medium">
                {formData.images.length} Görsel
              </Badge>
            </CardHeader>
            <CardContent className="p-4">
              <PortfolioImageGallery
                images={formData.images}
                coverImage={formData.coverImage}
                onImagesChange={handleImagesChange}
                onCoverImageChange={handleCoverImageChange}
                disabled={submitting}
                pageContext="portfolio"
              />
              {fieldErrors.images && <p className="mt-2 text-xs text-red-600 font-medium">{fieldErrors.images}</p>}
              {fieldErrors.coverImage && <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.coverImage}</p>}
            </CardContent>
          </Card>

          {/* 3D Models */}
          <Card className="rounded-xl overflow-hidden p-0">
            <CardHeader className="p-4 border-b border-border-subtle bg-surface-secondary/50 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="font-semibold text-gray-900 flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-500" />
                3D Varlıklar
              </CardTitle>
              <label className={`cursor-pointer inline-flex items-center px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors ${uploadingModel ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="file"
                  accept=".stl,.obj,.gltf,.glb"
                  onChange={handle3DModelUpload}
                  className="hidden"
                  disabled={uploadingModel || submitting}
                />
                {uploadingModel ? (
                  <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Yükleniyor...</>
                ) : (
                  '+ Model Ekle'
                )}
              </label>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {formData.models3D && formData.models3D.length > 0 ? (
                formData.models3D.map((model, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border-subtle rounded-xl bg-surface-secondary hover:border-gray-300 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-white border border-border rounded-lg flex items-center justify-center shrink-0">
                        <Box className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate" title={model.name}>{model.name}</p>
                        <p className="text-xs text-gray-500 uppercase">{model.format} &bull; {formatFileSize(model.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => toggle3DModelDownloadable(index)}
                        className={`p-1.5 rounded-lg transition-colors ${model.downloadable ? 'text-success-dark bg-success-light' : 'text-gray-400 hover:bg-white'}`}
                        title={model.downloadable ? 'İndirilebilir' : 'İndirilemez'}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove3DModel(index)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-border-subtle rounded-xl">
                  <Box className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Henüz 3D model eklenmemiş</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Content (60%) */}
        <div className="lg:col-span-7 space-y-6">
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

          {/* Basic Info - Per Language */}
          <Card className="rounded-xl p-6">
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Proje Başlığı
                  {activeLanguage && (
                    <Badge variant="default" className="ml-2 text-xs">
                      {languages.find(l => l.code === activeLanguage)?.flag} {languages.find(l => l.code === activeLanguage)?.nativeLabel}
                    </Badge>
                  )}
                </label>
                <input
                  type="text"
                  id="title"
                  value={currentTranslation.title}
                  onChange={(e) => {
                    markDirty();
                    const newTitle = e.target.value;
                    setTranslations(prev => ({
                      ...prev,
                      [activeLanguage]: { ...prev[activeLanguage], title: newTitle }
                    }));
                    if (activeLanguage === defaultLanguage?.code && slugLocked) {
                      setFormData(prev => ({
                        ...prev,
                        title: newTitle,
                        slug: slugify(newTitle, { lower: true, strict: true })
                      }));
                    }
                  }}
                  onBlur={() => validateField('title')}
                  className={`w-full h-11 px-3.5 text-sm border rounded-lg bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${fieldErrors.title ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-border'}`}
                  placeholder="Projenize bir isim verin"
                />
                {fieldErrors.title && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.title}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* URL Slug */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">URL Slug</label>
                  <div className={`flex items-center h-11 border rounded-lg bg-white px-3.5 transition-all ${fieldErrors.slug ? 'border-red-300 focus-within:ring-red-500/20 focus-within:border-red-500' : 'border-border focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500'}`}>
                    <span className="text-gray-400 text-sm mr-1 shrink-0">/portfolio/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => {
                        markDirty();
                        setFormData(prev => ({ ...prev, slug: e.target.value }));
                      }}
                      readOnly={slugLocked}
                      className="flex-1 bg-transparent border-none text-sm text-gray-700 focus:outline-none focus:ring-0 p-0 min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => setSlugLocked(!slugLocked)}
                      className="ml-2 shrink-0 text-gray-400 hover:text-brand-600 transition-colors"
                      title={slugLocked ? 'Slug düzenlemeyi aç' : 'Slug otomatik moduna dön'}
                    >
                      {slugLocked ? <Pencil className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {slugLocked ? 'Başlıktan otomatik oluşturulur' : 'Manuel düzenleme modu'}
                  </p>
                </div>

                {/* Client */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Müşteri</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.client}
                      onChange={(e) => {
                        markDirty();
                        setFormData(prev => ({ ...prev, client: e.target.value }));
                      }}
                      onBlur={() => validateField('client')}
                      className={`w-full h-11 pl-10 pr-3.5 text-sm border rounded-lg bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${fieldErrors.client ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-border'}`}
                      placeholder="Şirket veya Kişi Adı"
                    />
                  </div>
                  {fieldErrors.client && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.client}</p>}
                </div>
              </div>

              {/* Description Editor */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Açıklama</label>
                <UniversalEditor
                  key={activeLanguage}
                  value={currentTranslation.description}
                  onChange={(content) => {
                    markDirty();
                    setTranslations(prev => ({
                      ...prev,
                      [activeLanguage]: { ...prev[activeLanguage], description: content }
                    }));
                  }}
                  placeholder="Projenin hikayesini anlatın..."
                  minHeight="300px"
                />
                {fieldErrors.description && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.description}</p>}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Kısa Açıklama (Özet)</label>
                <textarea
                  rows={2}
                  value={currentTranslation.excerpt}
                  onChange={(e) => {
                    markDirty();
                    setTranslations(prev => ({
                      ...prev,
                      [activeLanguage]: { ...prev[activeLanguage], excerpt: e.target.value }
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 text-sm border border-border rounded-lg bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-y"
                  placeholder="Proje için kısa açıklama..."
                />
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Meta Açıklaması (SEO)</label>
                <textarea
                  rows={2}
                  maxLength={160}
                  value={currentTranslation.metaDescription}
                  onChange={(e) => {
                    markDirty();
                    setTranslations(prev => ({
                      ...prev,
                      [activeLanguage]: { ...prev[activeLanguage], metaDescription: e.target.value }
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 text-sm border border-border rounded-lg bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-y"
                  placeholder="SEO meta açıklaması..."
                />
                <p className="text-xs text-gray-400 mt-1.5">{currentTranslation.metaDescription.length}/160 karakter</p>
              </div>
            </div>
          </Card>

          {/* Metadata & Tech */}
          <Card className="rounded-xl p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categories */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2.5 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-success" />
                    Kategoriler
                  </label>
                  {loadingCategories ? (
                    <div className="flex gap-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 w-20 bg-gray-100 rounded-full animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat._id}
                          type="button"
                          onClick={() => {
                            handleCategoryToggle(cat._id);
                            setTimeout(() => validateField('categoryIds'), 0);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${formData.categoryIds.includes(cat._id)
                            ? 'bg-success-light border-success/20 text-success-dark'
                            : 'bg-white border-border text-gray-600 hover:border-success/20'
                            }`}
                        >
                          {cat.name}
                          {formData.categoryIds.includes(cat._id) && <Check className="w-3 h-3 inline-block ml-1" />}
                        </button>
                      ))}
                    </div>
                  )}
                  {fieldErrors.categoryIds && <p className="mt-2 text-xs text-red-600">{fieldErrors.categoryIds}</p>}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-warning" />
                    Tamamlanma Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.completionDate}
                    onChange={(e) => {
                      markDirty();
                      setFormData(prev => ({ ...prev, completionDate: e.target.value }));
                    }}
                    onBlur={() => validateField('completionDate')}
                    className={`w-full h-11 px-3.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${fieldErrors.completionDate ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-border'}`}
                  />
                  {fieldErrors.completionDate && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.completionDate}</p>}
                </div>
              </div>

              {/* Technologies - Tag/Chip UI */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2.5 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-violet-500" />
                  Teknolojiler
                </label>
                <div className={`flex flex-wrap items-center gap-2 px-3.5 py-2.5 border rounded-lg bg-white transition-all min-h-[44px] focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 ${formData.technologies.length === 0 ? 'border-border' : 'border-border'}`}>
                  {formData.technologies.map((tech, index) => (
                    <span
                      key={`${tech}-${index}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-md text-xs font-medium"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(index)}
                        className="text-violet-400 hover:text-violet-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleTechKeyDown}
                    onBlur={() => {
                      if (techInput.trim()) addTechnology(techInput);
                    }}
                    placeholder={formData.technologies.length === 0 ? 'Teknoloji ekle...' : 'Ekle...'}
                    className="flex-1 min-w-[100px] bg-transparent border-none text-sm focus:outline-none focus:ring-0 p-0 placeholder:text-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Enter ile ekleyin, Backspace ile son etiketi silin</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
