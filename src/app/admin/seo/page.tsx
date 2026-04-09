'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Check, X, Plus, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ISeoConfig {
  metaTitleSuffix: string;
  globalMetaDescription: string;
  globalKeywords: string[];
  enableSchemaMarkup: boolean;
  enableOpenGraph: boolean;
  enableTwitterCards: boolean;
}

const DEFAULT_CONFIG: ISeoConfig = {
  metaTitleSuffix: ' | Fixral',
  globalMetaDescription: '',
  globalKeywords: [],
  enableSchemaMarkup: true,
  enableOpenGraph: true,
  enableTwitterCards: true,
};

export default function AdminSeoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ISeoConfig>(DEFAULT_CONFIG);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [keywordInput, setKeywordInput] = useState('');

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/site-settings');
      if (res.ok) {
        const data = await res.json();
        if (data.seoConfig) {
          setConfig({ ...DEFAULT_CONFIG, ...data.seoConfig });
        }
      }
    } catch (err) {
      console.error('SEO ayarları yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seoConfig: config }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'SEO ayarları başarıyla kaydedildi!' });
      } else {
        throw new Error('Kaydetme başarısız');
      }
    } catch {
      setMessage({ type: 'error', text: 'SEO ayarları kaydedilirken bir hata oluştu.' });
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (!trimmed) return;

    const newKeywords = trimmed
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k && !config.globalKeywords.includes(k));

    if (newKeywords.length > 0) {
      setConfig((prev) => ({
        ...prev,
        globalKeywords: [...prev.globalKeywords, ...newKeywords],
      }));
    }
    setKeywordInput('');
  };

  const removeKeyword = (keyword: string) => {
    setConfig((prev) => ({
      ...prev,
      globalKeywords: prev.globalKeywords.filter((k) => k !== keyword),
    }));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const toggleField = (field: keyof ISeoConfig) => {
    setConfig((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Search className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">SEO Ayarları</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Arama motoru optimizasyonu ve meta etiket yapılandırması
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 self-start sm:self-auto"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Kaydet
            </>
          )}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Meta Tags Section */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Meta Etiketleri</h2>
            <p className="text-sm text-muted-foreground">
              Sayfa başlıkları ve açıklamaları için varsayılan değerler
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Meta Başlık Eki (Suffix)
            </label>
            <input
              type="text"
              value={config.metaTitleSuffix}
              onChange={(e) => setConfig((prev) => ({ ...prev, metaTitleSuffix: e.target.value }))}
              className="w-full px-3 py-2 bg-transparent border border-input rounded-lg text-foreground text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
              placeholder=" | Fixral"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Her sayfa başlığının sonuna eklenir. Örn: &quot;Hakkımızda{config.metaTitleSuffix || ' | Fixral'}&quot;
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Genel Meta Açıklama
            </label>
            <textarea
              value={config.globalMetaDescription}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, globalMetaDescription: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 bg-transparent border border-input rounded-lg text-foreground text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow resize-none"
              placeholder="Sitenizin genel açıklamasını girin..."
            />
            <div className="flex justify-between mt-1.5">
              <p className="text-xs text-muted-foreground">
                Özel açıklaması olmayan sayfalar için kullanılır
              </p>
              <span
                className={`text-xs ${
                  config.globalMetaDescription.length > 160
                    ? 'text-amber-600'
                    : 'text-muted-foreground'
                }`}
              >
                {config.globalMetaDescription.length}/160
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords Section */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
            <span className="text-violet-600 font-bold text-sm">#</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Anahtar Kelimeler</h2>
            <p className="text-sm text-muted-foreground">
              Site genelinde kullanılacak anahtar kelimeler
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeywordKeyDown}
              className="flex-1 px-3 py-2 bg-transparent border border-input rounded-lg text-foreground text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
              placeholder="Anahtar kelime ekleyin (virgülle ayırarak birden fazla ekleyebilirsiniz)"
            />
            <button
              onClick={addKeyword}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 text-sm font-medium shrink-0"
            >
              <Plus className="w-4 h-4" />
              Ekle
            </button>
          </div>

          {config.globalKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {config.globalKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm border border-slate-200 dark:border-slate-700"
                >
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Henüz anahtar kelime eklenmedi.
            </p>
          )}
        </div>
      </div>

      {/* Structured Data & Social Section */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <span className="text-emerald-600 font-bold text-base">{ }</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Yapılandırılmış Veri & Sosyal</h2>
            <p className="text-sm text-muted-foreground">
              Schema markup ve sosyal medya etiketleri
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Schema Markup */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <span className="font-medium text-foreground">Schema Markup</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Arama motorlarının içeriğinizi daha iyi anlaması için JSON-LD yapılandırılmış veri
              </p>
            </div>
            <button
              onClick={() => toggleField('enableSchemaMarkup')}
              className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${
                config.enableSchemaMarkup ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  config.enableSchemaMarkup ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Open Graph */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <span className="font-medium text-foreground">Open Graph</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Facebook, LinkedIn ve diğer platformlarda paylaşım önizlemeleri
              </p>
            </div>
            <button
              onClick={() => toggleField('enableOpenGraph')}
              className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${
                config.enableOpenGraph ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  config.enableOpenGraph ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Twitter Cards */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <span className="font-medium text-foreground">Twitter Cards</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                X (Twitter) üzerinde zengin paylaşım kartları
              </p>
            </div>
            <button
              onClick={() => toggleField('enableTwitterCards')}
              className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${
                config.enableTwitterCards ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  config.enableTwitterCards ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Değişiklikleri Kaydet
            </>
          )}
        </button>
      </div>
    </div>
  );
}
