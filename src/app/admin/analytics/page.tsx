'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BarChart3, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface IAnalyticsConfig {
  googleAnalyticsId: string;
  googleTagManagerId: string;
  googleSiteVerification: string;
  enablePageViewTracking: boolean;
}

const defaultConfig: IAnalyticsConfig = {
  googleAnalyticsId: '',
  googleTagManagerId: '',
  googleSiteVerification: '',
  enablePageViewTracking: true,
};

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [config, setConfig] = useState<IAnalyticsConfig>(defaultConfig);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }
    if (session?.user?.role !== 'admin') {
      router.push('/admin/dashboard');
      return;
    }
    loadConfig();
  }, [status, session, router]);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/site-settings');
      if (response.ok) {
        const data = await response.json();
        if (data.analyticsConfig) {
          setConfig((prev) => ({ ...prev, ...data.analyticsConfig }));
        }
      }
    } catch (error) {
      console.error('Analitik ayarları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyticsConfig: config }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Analitik ayarları başarıyla kaydedildi!' });
      } else {
        throw new Error('Ayarlar kaydedilemedi');
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      setMessage({ type: 'error', text: 'Ayarlar kaydedilirken bir hata oluştu.' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof IAnalyticsConfig>(key: K, value: IAnalyticsConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (status === 'loading' || loading) {
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
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analitik Ayarları</h1>
            <p className="text-muted-foreground mt-0.5">
              Google Analytics, Tag Manager ve sayfa izleme yapılandırması
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Kaydet
            </>
          )}
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Google Analytics */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Google Analytics</h2>
            <p className="text-sm text-muted-foreground">GA4 ölçüm kimliği ve Tag Manager yapılandırması</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="block text-sm font-medium text-foreground mb-1.5">
              Google Analytics ID (GA4)
            </Label>
            <Input
              type="text"
              value={config.googleAnalyticsId}
              onChange={(e) => updateField('googleAnalyticsId', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Google Analytics 4 ölçüm kimliğiniz. Örnek: G-AB1CD2EF3G
            </p>
          </div>

          <div>
            <Label className="block text-sm font-medium text-foreground mb-1.5">
              Google Tag Manager ID
            </Label>
            <Input
              type="text"
              value={config.googleTagManagerId}
              onChange={(e) => updateField('googleTagManagerId', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="GTM-XXXXXXX"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Google Tag Manager konteyner kimliğiniz. Örnek: GTM-A1B2C3D
            </p>
          </div>
        </div>
      </div>

      {/* Site Verification */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Site Doğrulama</h2>
            <p className="text-sm text-muted-foreground">Google Search Console site doğrulama kodu</p>
          </div>
        </div>

        <div>
          <Label className="block text-sm font-medium text-foreground mb-1.5">
            Google Site Verification
          </Label>
          <Input
            type="text"
            value={config.googleSiteVerification}
            onChange={(e) => updateField('googleSiteVerification', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Doğrulama meta tag içeriği"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Google Search Console&apos;dan aldığınız doğrulama kodunu girin. Örnek: jXX7ASmYpD2OOlPo5cKqGptc9Zy...
          </p>
        </div>
      </div>

      {/* Tracking Options */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">İzleme Seçenekleri</h2>
            <p className="text-sm text-muted-foreground">Sayfa görüntüleme ve olay izleme tercihleri</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <span className="font-medium text-foreground">Sayfa Görüntüleme İzleme</span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ziyaretçilerin sayfa görüntülemelerini otomatik olarak izler
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateField('enablePageViewTracking', !config.enablePageViewTracking)}
            className={`w-12 h-6 rounded-full relative transition-colors ${
              config.enablePageViewTracking ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                config.enablePageViewTracking ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
        <h3 className="font-semibold text-indigo-900 mb-1.5">Nasıl Çalışır?</h3>
        <ul className="text-sm text-indigo-700 space-y-1 list-disc list-inside">
          <li>Google Analytics ID girildiğinde, tüm sayfalara GA4 izleme kodu otomatik eklenir.</li>
          <li>Tag Manager ID girildiğinde, GTM konteyner kodu sayfa başına yerleştirilir.</li>
          <li>Site doğrulama kodu, Google Search Console sahiplik doğrulaması için kullanılır.</li>
          <li>Sayfa görüntüleme izleme kapatıldığında otomatik pageview olayları gönderilmez.</li>
        </ul>
      </div>
    </div>
  );
}
