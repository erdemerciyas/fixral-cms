'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Archive,
  CloudDownload,
  CloudUpload,
  FileIcon,
  CheckCircle2,
  AlertCircle,
  Database,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminBackupPage() {
  const { status } = useSession();
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/admin/login');
    return null;
  }

  const handleExport = async (includeMedia: boolean) => {
    setExporting(true);
    try {
      const url = includeMedia
        ? '/api/admin/backup/export?includeMedia=true'
        : '/api/admin/backup/export?includeMedia=false';

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Dışa aktarma başarısız');
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const date = new Date().toISOString().slice(0, 10);
      a.download = `fixral-backup-${date}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      toast.success('Yedek başarıyla indirildi');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Dışa aktarma sırasında hata oluştu');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip') && !file.name.endsWith('.json')) {
      toast.error('Lütfen .zip veya .json dosyası seçin');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/backup/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImportResult({ type: 'success', text: data.message || 'Yedek başarıyla içe aktarıldı' });
        toast.success('İçe aktarma başarılı');
      } else {
        throw new Error(data.error || 'İçe aktarma başarısız');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'İçe aktarma sırasında hata oluştu';
      setImportResult({ type: 'error', text: msg });
      toast.error(msg);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Yedekleme & Geri Yükleme</h1>
        <p className="text-muted-foreground mt-1">Site verilerinizi dışa aktarın veya yedeği geri yükleyin</p>
      </div>

      {importResult && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          importResult.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {importResult.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          {importResult.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <CloudDownload className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Dışa Aktar</h2>
              <p className="text-sm text-muted-foreground">Tüm site verilerini ZIP olarak indir</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            Haberler, portfolyo, hizmetler, slider, ayarlar ve diğer tüm verileri tek bir ZIP dosyası olarak bilgisayarınıza indirin.
          </p>

          <div className="space-y-2">
            <Button
              onClick={() => handleExport(true)}
              disabled={exporting}
              className="w-full bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Hazırlanıyor...</span>
                </>
              ) : (
                <>
                  <Archive className="w-5 h-5" />
                  <span>Tam Yedek (DB + Medya)</span>
                </>
              )}
            </Button>
            <Button
              onClick={() => handleExport(false)}
              disabled={exporting}
              variant="outline"
              className="w-full rounded-xl flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4" />
              <span>Sadece Veritabanı</span>
            </Button>
          </div>
        </div>

        {/* Import Card */}
        <div className="bg-card rounded-xl shadow-sm border border-border/60 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <CloudUpload className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">İçe Aktar</h2>
              <p className="text-sm text-muted-foreground">Yedek dosyasından geri yükle</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6 flex-1">
            Daha önce oluşturulmuş bir yedek dosyasını yükleyerek verilerinizi geri yükleyin.
            <span className="block mt-2 text-amber-600 font-medium">
              Dikkat: Mevcut veriler yedekteki verilerle değiştirilecektir.
            </span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip,.json"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            variant="outline"
            className="w-full rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent" />
                <span>İçe aktarılıyor...</span>
              </>
            ) : (
              <>
                <FileIcon className="w-5 h-5" />
                <span>Yedek Dosyası Seç (.zip / .json)</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-6 border border-indigo-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Archive className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Yedekleme Hakkında</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>Tam Yedek:</strong> Veritabanı + tüm medya dosyaları (Cloudinary&apos;den indirilir)</li>
              <li><strong>Sadece DB:</strong> Medya URL&apos;leri korunur, dosyalar indirilmez (daha hızlı)</li>
              <li>İçe aktarma hem .zip hem .json formatını destekler</li>
              <li>Düzenli yedek almayı unutmayın</li>
              <li>Büyük siteler için tam yedek birkaç dakika sürebilir</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
