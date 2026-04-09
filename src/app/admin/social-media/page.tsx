'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Share2,
  Check,
  Globe,
  Link,
  ToggleLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface ISocialMediaConfig {
  twitter: string;
  instagram: string;
  linkedin: string;
  github: string;
  facebook: string;
  youtube: string;
  enableSharing: boolean;
  showShareCount: boolean;
}

const defaultConfig: ISocialMediaConfig = {
  twitter: '',
  instagram: '',
  linkedin: '',
  github: '',
  facebook: '',
  youtube: '',
  enableSharing: true,
  showShareCount: false,
};

const socialFields = [
  { key: 'twitter' as const, label: 'Twitter / X', icon: Globe, placeholder: 'https://twitter.com/kullaniciadi', color: 'text-sky-500' },
  { key: 'instagram' as const, label: 'Instagram', icon: Globe, placeholder: 'https://instagram.com/kullaniciadi', color: 'text-pink-500' },
  { key: 'linkedin' as const, label: 'LinkedIn', icon: Globe, placeholder: 'https://linkedin.com/in/kullaniciadi', color: 'text-blue-600' },
  { key: 'github' as const, label: 'GitHub', icon: Globe, placeholder: 'https://github.com/kullaniciadi', color: 'text-gray-800 dark:text-gray-200' },
  { key: 'facebook' as const, label: 'Facebook', icon: Globe, placeholder: 'https://facebook.com/kullaniciadi', color: 'text-blue-500' },
  { key: 'youtube' as const, label: 'YouTube', icon: Globe, placeholder: 'https://youtube.com/@kullaniciadi', color: 'text-red-500' },
];

export default function AdminSocialMediaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [config, setConfig] = useState<ISocialMediaConfig>(defaultConfig);

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
        if (data.socialMediaConfig) {
          setConfig(prev => ({ ...prev, ...data.socialMediaConfig }));
        }
      }
    } catch (error) {
      console.error('Sosyal medya ayarları yüklenirken hata:', error);
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
        body: JSON.stringify({ socialMediaConfig: config }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Sosyal medya ayarları başarıyla kaydedildi!' });
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

  const updateField = (key: keyof ISocialMediaConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const filledCount = socialFields.filter(f => config[f.key].trim() !== '').length;

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
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Share2 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sosyal Medya Ayarları</h1>
            <p className="text-muted-foreground mt-0.5">
              Sosyal medya bağlantılarınızı ve paylaşım tercihlerinizi yönetin
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? 'Kaydediliyor...' : (
            <>
              <Check className="w-5 h-5" />
              Kaydet
            </>
          )}
        </Button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Stats Bar */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-4 flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <Link className="w-4 h-4 text-indigo-500" />
          <span className="text-muted-foreground">Aktif bağlantılar:</span>
          <span className="font-semibold text-foreground">{filledCount} / {socialFields.length}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm">
          <ToggleLeft className="w-4 h-4 text-indigo-500" />
          <span className="text-muted-foreground">Paylaşım:</span>
          <span className={`font-semibold ${config.enableSharing ? 'text-emerald-600' : 'text-slate-400'}`}>
            {config.enableSharing ? 'Açık' : 'Kapalı'}
          </span>
        </div>
      </div>

      {/* Social Links Card */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Link className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Sosyal Medya Bağlantıları</h2>
            <p className="text-sm text-muted-foreground">Profillerinizin tam URL adreslerini girin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {socialFields.map(({ key, label, icon: Icon, placeholder, color }) => (
            <div key={key}>
              <Label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Icon className={`w-4 h-4 ${color}`} />
                {label}
              </Label>
              <Input
                type="url"
                value={config[key]}
                onChange={(e) => updateField(key, e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sharing Settings Card */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Paylaşım Ayarları</h2>
            <p className="text-sm text-muted-foreground">İçerik paylaşım özelliklerini yapılandırın</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div>
              <span className="font-medium text-foreground">Paylaşım Butonları</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                İçerik sayfalarında sosyal medya paylaşım butonlarını göster
              </p>
            </div>
            <button
              onClick={() => updateField('enableSharing', !config.enableSharing)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                config.enableSharing ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                config.enableSharing ? 'translate-x-6' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div>
              <span className="font-medium text-foreground">Paylaşım Sayısı</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Paylaşım butonlarının yanında paylaşım sayısını göster
              </p>
            </div>
            <button
              onClick={() => updateField('showShareCount', !config.showShareCount)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                config.showShareCount ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                config.showShareCount ? 'translate-x-6' : ''
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white" />
              <span>Kaydediliyor...</span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              <span>Değişiklikleri Kaydet</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
