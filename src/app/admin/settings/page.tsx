'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Check, ShieldCheck, CloudUpload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

interface Settings {
  _id?: string;
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  twitterHandle: string;
  googleSiteVerification: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxUploadSize: number;
  isActive: boolean;
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Logo upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);

  const [settings, setSettings] = useState<Settings>({
    siteName: '',
    siteTitle: '',
    siteDescription: '',
    siteKeywords: '',
    siteUrl: '',
    logo: '',
    favicon: '',
    twitterHandle: '',
    googleSiteVerification: '',
    googleAnalyticsId: '',
    googleTagManagerId: '',
    maintenanceMode: false,
    allowRegistration: false,
    maxUploadSize: 10,
    isActive: true,
  });

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

    loadSettings();
  }, [status, session, router]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/public/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Settings load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/public/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving settings.' });
    } finally {
      setSaving(false);
    }
  };

  // Logo upload functions
  const handleLogoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Dosya türü kontrolü
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Invalid file type. Please select PNG, JPG, WebP or SVG.' });
        return;
      }

      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size cannot exceed 5MB.' });
        return;
      }

      setLogoFile(file);

      // Önizleme oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setUploadingLogo(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await fetch('/api/admin/logo-upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          logo: data.logoUrl
        }));
        setLogoFile(null);
        setLogoPreview(null);
        setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
      } else {
        throw new Error('Logo upload failed');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      setMessage({ type: 'error', text: 'An error occurred while uploading logo.' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const clearLogoPreview = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Medya kütüphanesi entegrasyonu
  const handleBrowseMedia = () => {
    setShowMediaBrowser(true);
  };

  const handleCloseMediaBrowser = () => {
    setShowMediaBrowser(false);
  };

  const handleMediaSelect = (url: string | string[]) => {
    const selectedUrl = Array.isArray(url) ? url[0] : url;
    if (selectedUrl && (selectedUrl.startsWith('/') || selectedUrl.startsWith('http://') || selectedUrl.startsWith('https://'))) {
      setSettings(prev => ({ ...prev, logo: selectedUrl }));
      setMessage({ type: 'success', text: 'Logo selected from media library.' });
    }
    setShowMediaBrowser(false);
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
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your site configuration</p>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Basic Settings */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6">
        <h2 className="text-lg font-bold text-foreground mb-6">Basic Site Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Site Name
            </Label>
            <Input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleInputChange('siteName', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Your site name"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Site URL
            </Label>
            <Input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => handleInputChange('siteUrl', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="https://example.com"
            />
          </div>

          <div className="md:col-span-2">
            <Label className="block text-sm font-medium text-foreground mb-2">
              Site Title (SEO)
            </Label>
            <Input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => handleInputChange('siteTitle', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="SEO site title"
            />
          </div>

          <div className="md:col-span-2">
            <Label className="block text-sm font-medium text-foreground mb-2">
              Site Description
            </Label>
            <Textarea
              value={settings.siteDescription}
              onChange={(e) => handleInputChange('siteDescription', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              placeholder="Your site description..."
            />
          </div>

          <div className="md:col-span-2">
            <Label className="block text-sm font-medium text-foreground mb-2">
              SEO Keywords
            </Label>
            <Input
              type="text"
              value={settings.siteKeywords}
              onChange={(e) => handleInputChange('siteKeywords', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="engineering, 3d scanning, technology (comma separated)"
            />
          </div>
        </div>
      </div>

      {/* Logo Section */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6">
        <h2 className="text-lg font-bold text-foreground mb-6">Logo and Visual Settings</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Logo Upload */}
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground">Logo Upload</h3>
            
            {/* Current Logo */}
            <div className="bg-muted/50 rounded-xl p-6 border border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">Current Logo</h4>
              <div className="flex items-center justify-center h-32 bg-card rounded-xl">
                {settings.logo ? (
                  <Image 
                    src={settings.logo} 
                    alt="Current Logo" 
                    width={80}
                    height={80}
                    style={{ objectFit: 'contain' }}
                    className="max-w-full max-h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-sm">No logo uploaded yet</span>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Area */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Upload New Logo</h4>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors cursor-pointer"
              >
                <CloudUpload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Click to select a file
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WebP, SVG • Max 5MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoFileSelect}
                className="hidden"
              />

              {/* File Preview */}
              {logoPreview && (
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-foreground">Preview</h5>
                    <button
                      onClick={clearLogoPreview}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Image 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      width={64}
                      height={64}
                      className="rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{logoFile?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {logoFile ? `${(logoFile.size / 1024).toFixed(1)} KB` : ''}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-indigo-500/30"
                  >
                    {uploadingLogo ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <CloudUpload className="w-4 h-4" />
                        <span>Upload Logo</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Manual URL */}
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-foreground">
                  Logo URL (manual)
                </Label>
                <Input
                  type="url"
                  value={settings.logo}
                  onChange={(e) => handleInputChange('logo', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </div>

          {/* Other Settings */}
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground">Other Settings</h3>
            
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Favicon URL
              </Label>
              <Input
                type="url"
                value={settings.favicon}
                onChange={(e) => handleInputChange('favicon', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="/favicon.ico"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Twitter Handle
              </Label>
              <Input
                type="text"
                value={settings.twitterHandle}
                onChange={(e) => handleInputChange('twitterHandle', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="@username"
              />
            </div>

            {/* Brand Preview */}
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-6 border border-indigo-200">
              <h4 className="text-sm font-medium text-foreground mb-3">Brand Preview</h4>
              <div className="flex items-center space-x-4">
                {settings.logo && (
                  <Image 
                    src={settings.logo} 
                    alt="Logo" 
                    width={48}
                    height={48}
                    style={{ objectFit: 'contain' }}
                  />
                )}
                <div>
                  <h5 className="text-lg font-semibold text-foreground">
                    {settings.siteName || 'Your Site Name'}
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    {settings.siteDescription || 'Your site description'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6">
        <h2 className="text-lg font-bold text-foreground mb-6">System Settings</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="maintenance"
                checked={settings.maintenanceMode}
                onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                className="w-5 h-5 text-indigo-600 border-border rounded focus:ring-indigo-500"
              />
              <Label htmlFor="maintenance" className="text-sm font-medium text-foreground">
                Maintenance Mode
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="registration"
                checked={settings.allowRegistration}
                onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                className="w-5 h-5 text-indigo-600 border-border rounded focus:ring-indigo-500"
              />
              <Label htmlFor="registration" className="text-sm font-medium text-foreground">
                Allow User Registration
              </Label>
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Maximum Upload Size (MB)
            </Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={settings.maxUploadSize}
              onChange={(e) => handleInputChange('maxUploadSize', parseInt(e.target.value))}
              className="w-full md:w-1/3 px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {settings.maintenanceMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
                <div>
                  <h3 className="text-base font-semibold text-amber-800">Maintenance Mode Active</h3>
                  <p className="text-sm text-amber-700">Site is not accessible to visitors. Only admin users can access.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SEO and Analytics */}
      <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6">
        <h2 className="text-lg font-bold text-foreground mb-6">SEO and Analytics</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Google Site Verification Code
            </Label>
            <Input
              type="text"
              value={settings.googleSiteVerification}
              onChange={(e) => handleInputChange('googleSiteVerification', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="google-site-verification code"
            />
            <p className="text-xs text-muted-foreground mt-1">Example: jXX7ASmYpD2OOlPo5cKqGptc9Zy1yLxl00b-JqlQHZE</p>
          </div>

          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Google Analytics (GA4) Measurement ID
            </Label>
            <Input
              type="text"
              value={settings.googleAnalyticsId}
              onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="G-XXXXXXXXXX"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Google Tag Manager (GTM) ID
            </Label>
            <Input
              type="text"
              value={settings.googleTagManagerId}
              onChange={(e) => handleInputChange('googleTagManagerId', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="GTM-XXXXXXX"
            />
          </div>

          <div className="md:col-span-2 bg-muted/50 border border-border rounded-xl p-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">Sitemap</h4>
            <p className="text-sm text-muted-foreground">Sitemap is automatically generated: <code className="bg-card px-2 py-1 rounded-lg border border-border">/api/sitemap</code>. Add it to Google Search Console.</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={saving}
          className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              <span>Save Settings</span>
            </>
          )}
        </Button>
      </div>

      {/* Media Browser Modal */}
      {showMediaBrowser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-bold text-foreground">Select Media</h3>
              <button
                onClick={handleCloseMediaBrowser}
                className="p-2 hover:bg-muted rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-muted-foreground mb-4">
                Click to select a logo from the media library
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
