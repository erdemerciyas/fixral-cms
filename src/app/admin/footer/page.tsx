'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Fingerprint,
  Link2,
  Phone,
  Share2,
  Eye,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

// --- Interfaces ---

interface QuickLink {
  title: string;
  url: string;
  isExternal: boolean;
  _id?: string;
}

interface FooterSettings {
  mainDescription: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  quickLinks: QuickLink[];
  socialLinks: {
    linkedin: string;
    twitter: string;
    instagram: string;
    facebook: string;
    github: string;
    youtube: string;
  };
  copyrightInfo: {
    companyName: string;
    year: number;
    additionalText: string;
  };
  developerInfo: {
    name: string;
    website: string;
    companyName: string;
  };
  visibility: {
    showQuickLinks: boolean;
    showSocialLinks: boolean;
    showContactInfo: boolean;
    showDeveloperInfo: boolean;
  };
}

const DEFAULT_SETTINGS: FooterSettings = {
  mainDescription: '',
  contactInfo: { email: '', phone: '', address: '' },
  quickLinks: [],
  socialLinks: { linkedin: '', twitter: '', instagram: '', facebook: '', github: '', youtube: '' },
  copyrightInfo: { companyName: '', year: new Date().getFullYear(), additionalText: '' },
  developerInfo: { name: '', website: '', companyName: '' },
  visibility: { showQuickLinks: true, showSocialLinks: true, showContactInfo: true, showDeveloperInfo: true }
};

export default function AdminFooterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_SETTINGS);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }
    loadSettings();
  }, [status, router]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/footer-settings', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      } else {
        showNotification('error', 'Ayarlar yüklenemedi');
      }
    } catch (error) {
      console.error('Error loading footer settings:', error);
      showNotification('error', 'Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setNotification(null);
    try {
      const response = await fetch('/api/admin/footer-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        showNotification('success', 'Footer ayarları başarıyla kaydedildi');
      } else {
        throw new Error('Kaydetme başarısız');
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification('error', 'Kaydedilirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section: keyof FooterSettings, key: string | null, value: any) => {
    setSettings(prev => {
      if (key) {
        return {
          ...prev,
          [section]: {
            ...(prev[section] as any),
            [key]: value
          }
        };
      } else {
        return {
          ...prev,
          [section]: value
        };
      }
    });
  };

  // Quick Links Helpers
  const addQuickLink = () => {
    setSettings(prev => ({
      ...prev,
      quickLinks: [...prev.quickLinks, { title: '', url: '', isExternal: false }]
    }));
  };

  const removeQuickLink = (index: number) => {
    setSettings(prev => ({
      ...prev,
      quickLinks: prev.quickLinks.filter((_, i) => i !== index)
    }));
  };

  const updateQuickLink = (index: number, field: keyof QuickLink, value: any) => {
    setSettings(prev => ({
      ...prev,
      quickLinks: prev.quickLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      )
    }));
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
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Genel & Hakkında', icon: FileText },
    { id: 'contact', label: 'İletişim', icon: Phone },
    { id: 'links', label: 'Hızlı Linkler', icon: Link2 },
    { id: 'social', label: 'Sosyal Medya', icon: Share2 },
    { id: 'developer', label: 'Telif & Geliştirici', icon: Fingerprint },
    { id: 'visibility', label: 'Görünürlük', icon: Eye },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20 relative">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-fade-in-down ${notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
          }`}>
          {notification.type === 'success' ? (
            <Check className="w-6 h-6 text-emerald-600" />
          ) : (
            <X className="w-6 h-6 text-red-600" />
          )}
          <div>
            <h4 className="font-semibold">{notification.type === 'success' ? 'Başarılı' : 'Hata'}</h4>
            <p className="text-sm opacity-90">{notification.message}</p>
          </div>
          <Button onClick={() => setNotification(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Footer Yönetimi</h1>
          <p className="text-muted-foreground mt-1">Site alt kısmı (footer) içeriklerini düzenleyin.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {saving ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Check className="w-5 h-5" />
          )}
          <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-card rounded-xl shadow-sm border border-border p-2 space-y-1 sticky top-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-card rounded-xl shadow-sm border border-border p-6 min-h-[500px]">

          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground border-b pb-4 mb-6">Genel Bilgiler</h2>
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Ana Açıklama Metni (Hakkında)
                </Label>
                <Textarea
                  rows={4}
                  value={settings.mainDescription}
                  onChange={(e) => handleChange('mainDescription', null, e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Şirketiniz hakkında kısa bir açıklama..."
                />
                <p className="text-xs text-muted-foreground mt-2">Footer sol tarafında logo altında görünen metin.</p>
              </div>
            </div>
          )}

          {/* CONTACT TAB */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground border-b pb-4 mb-6">İletişim Bilgileri</h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">E-posta Adresi</Label>
                  <Input
                    type="email"
                    value={settings.contactInfo.email}
                    onChange={(e) => handleChange('contactInfo', 'email', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="ornek@sirket.com"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">Telefon Numarası</Label>
                  <Input
                    type="text"
                    value={settings.contactInfo.phone}
                    onChange={(e) => handleChange('contactInfo', 'phone', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="+90 555 123 45 67"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-2">Adres</Label>
                  <Textarea
                    rows={3}
                    value={settings.contactInfo.address}
                    onChange={(e) => handleChange('contactInfo', 'address', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Şirket adresi..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* LINKS TAB */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <h2 className="text-xl font-bold text-foreground">Hızlı Linkler</h2>
                <button
                  onClick={addQuickLink}
                  className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Yeni Link Ekle
                </button>
              </div>

              {settings.quickLinks.length === 0 ? (
                <div className="text-center py-12 bg-muted/50 rounded-xl border border-dashed border-border">
                  <Link2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Henüz link eklenmemiş.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {settings.quickLinks.map((link, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-muted/50 rounded-xl border border-slate-100 items-start group">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <Label className="block text-xs font-medium text-muted-foreground mb-1">Başlık</Label>
                          <Input
                            type="text"
                            value={link.title}
                            onChange={(e) => updateQuickLink(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Anasayfa"
                          />
                        </div>
                        <div>
                          <Label className="block text-xs font-medium text-muted-foreground mb-1">URL</Label>
                          <Input
                            type="text"
                            value={link.url}
                            onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="/anasayfa veya https://..."
                          />
                        </div>
                        <div className="flex items-center h-full pt-5">
                          <Label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={link.isExternal}
                              onChange={(e) => updateQuickLink(index, 'isExternal', e.target.checked)}
                              className="rounded border-border text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-muted-foreground">Dış Bağlantı</span>
                          </Label>
                        </div>
                      </div>
                      <button
                        onClick={() => removeQuickLink(index)}
                        className="mt-1 p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SOCIAL MEDIA TAB */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground border-b pb-4 mb-6">Sosyal Medya Bağlantıları</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'linkedin', label: 'LinkedIn' },
                  { key: 'twitter', label: 'Twitter / X' },
                  { key: 'instagram', label: 'Instagram' },
                  { key: 'facebook', label: 'Facebook' },
                  { key: 'github', label: 'GitHub' },
                  { key: 'youtube', label: 'YouTube' },
                ].map((social) => (
                  <div key={social.key}>
                    <Label className="block text-sm font-medium text-foreground mb-2">{social.label}</Label>
                    <Input
                      type="text"
                      value={(settings.socialLinks as any)[social.key] || ''}
                      onChange={(e) => handleChange('socialLinks', social.key, e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder={`https://${social.key.toLowerCase()}.com/...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DEVELOPER & COPYRIGHT TAB */}
          {activeTab === 'developer' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Telif Hakkı (Copyright)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/50 rounded-xl border border-border">
                  <div>
                    <Label className="block text-sm font-medium text-foreground mb-2">Şirket Adı</Label>
                    <Input
                      type="text"
                      value={settings.copyrightInfo.companyName}
                      onChange={(e) => handleChange('copyrightInfo', 'companyName', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-foreground mb-2">Yıl</Label>
                    <Input
                      type="number"
                      value={settings.copyrightInfo.year}
                      onChange={(e) => handleChange('copyrightInfo', 'year', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="block text-sm font-medium text-foreground mb-2">Ek Metin</Label>
                    <Input
                      type="text"
                      value={settings.copyrightInfo.additionalText}
                      onChange={(e) => handleChange('copyrightInfo', 'additionalText', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Tüm Hakları Saklıdır."
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Geliştirici Bilgisi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/50 rounded-xl border border-border">
                  <div>
                    <Label className="block text-sm font-medium text-foreground mb-2">Geliştirici Adı</Label>
                    <Input
                      type="text"
                      value={settings.developerInfo.name}
                      onChange={(e) => handleChange('developerInfo', 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-foreground mb-2">Firma Adı</Label>
                    <Input
                      type="text"
                      value={settings.developerInfo.companyName}
                      onChange={(e) => handleChange('developerInfo', 'companyName', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="block text-sm font-medium text-foreground mb-2">Web Sitesi</Label>
                    <Input
                      type="text"
                      value={settings.developerInfo.website}
                      onChange={(e) => handleChange('developerInfo', 'website', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VISIBILITY TAB */}
          {activeTab === 'visibility' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground border-b pb-4 mb-6">Görünürlük Ayarları</h2>
              <div className="bg-orange-50 text-orange-800 p-4 rounded-xl mb-6">
                <p className="text-sm">Buradaki ayarlar, footerdaki ilgili bölümlerin gösterilip gösterilmeyeceğini belirler.</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'showQuickLinks', label: 'Hızlı Linkleri Göster', desc: 'Menü linklerinin bulunduğu alanı gizle/göster.' },
                  { key: 'showSocialLinks', label: 'Sosyal Medya İkonlarını Göster', desc: 'Hakkında kısmının altındaki sosyal medya ikonları.' },
                  { key: 'showContactInfo', label: 'İletişim Bilgilerini Göster', desc: 'Adres, telefon ve email bilgilerini içeren alan.' },
                  { key: 'showDeveloperInfo', label: 'Geliştirici İmzasını Göster', desc: 'En alttaki "Geliştiren: ..." yazısı.' },
                ].map((item) => (
                  <Label key={item.key} className="flex items-start p-4 bg-muted/50 rounded-xl border border-slate-100 cursor-pointer hover:bg-muted transition-colors">
                    <div className="flex items-center h-5 mt-1">
                      <input
                        type="checkbox"
                        checked={(settings.visibility as any)[item.key]}
                        onChange={(e) => handleChange('visibility', item.key, e.target.checked)}
                        className="w-5 h-5 text-indigo-600 border-border rounded focus:ring-indigo-500"
                      />
                    </div>
                    <div className="ml-4">
                      <span className="block text-sm font-medium text-foreground">{item.label}</span>
                      <span className="block text-sm text-muted-foreground mt-1">{item.desc}</span>
                    </div>
                  </Label>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
