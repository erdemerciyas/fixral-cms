'use client';

import { useState, useEffect } from 'react';
import { 
  Mail as EnvelopeIcon, 
  CheckCircle as CheckCircleIcon, 
  XCircle as XCircleIcon, 
  AlertTriangle as ExclamationTriangleIcon,
  RefreshCw as ArrowPathIcon 
} from 'lucide-react';

interface MailStatus {
  configured: boolean;
  gmailUser: string | null;
  hasAppPassword: boolean;
  smtpTest: boolean;
  error: string | null;
}

export default function MailSystemStatus() {
  const [status, setStatus] = useState<MailStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkMailStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/mail-status');
      const result = await response.json();
      
      if (result.success) {
        setStatus(result.data);
        setLastCheck(new Date());
      }
    } catch (error) {
      console.error('Mail status check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMailStatus();
    // Her 5 dakikada bir otomatik kontrol
    const interval = setInterval(checkMailStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (!status?.configured) {
      return <XCircleIcon className="w-6 h-6 text-destructive" />;
    }
    if (status.smtpTest) {
      return <CheckCircleIcon className="w-6 h-6 text-success" />;
    }
    return <ExclamationTriangleIcon className="w-6 h-6 text-warning" />;
  };

  const getStatusMessage = () => {
    if (!status?.configured) {
      return 'Mail sistemi konfigüre edilmemiş';
    }
    if (status.smtpTest) {
      return 'Mail sistemi aktif ve çalışıyor';
    }
    if (status.error) {
      return `SMTP Hatası: ${status.error}`;
    }
    return 'Mail konfigürasyonu eksik';
  };

  const getStatusColor = () => {
    if (!status?.configured) return 'text-destructive';
    if (status.smtpTest) return 'text-success';
    return 'text-warning';
  };

  return (
    <div className="bg-card rounded-lg shadow-xs border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <EnvelopeIcon className="w-8 h-8 text-info" />
          <h3 className="text-lg font-semibold text-foreground">Mail Sistem Durumu</h3>
        </div>
        <button
          onClick={checkMailStatus}
          disabled={loading}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          title="Durumu yenile"
        >
          <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && !status ? (
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-info"></div>
          <span className="text-muted-foreground">Durum kontrol ediliyor...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Ana Durum */}
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusMessage()}
            </span>
          </div>

          {/* Detaylar */}
          {status && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Gmail Hesabı:</span>
                <span className="text-sm font-mono">
                  {status.gmailUser || 'Tanımlı değil'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">App Password:</span>
                <span className={`text-sm ${status.hasAppPassword ? 'text-success' : 'text-destructive'}`}>
                  {status.hasAppPassword ? '✓ Tanımlı' : '✗ Eksik'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">SMTP Test:</span>
                <span className={`text-sm ${status.smtpTest ? 'text-success' : 'text-destructive'}`}>
                  {status.smtpTest ? '✓ Başarılı' : '✗ Başarısız'}
                </span>
              </div>
              
              {lastCheck && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Son Kontrol:</span>
                  <span className="text-sm text-muted-foreground">
                    {lastCheck.toLocaleTimeString('tr-TR')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Hata Detayı */}
          {status?.error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
              <p className="text-sm text-destructive">
                <strong>Hata Detayı:</strong> {status.error}
              </p>
            </div>
          )}

          {/* Konfigürasyon Önerileri */}
          {!status?.configured && (
            <div className="mt-4 p-4 bg-info/10 border border-info/30 rounded-md">
              <h4 className="text-sm font-medium text-info mb-2">
                Mail Sistemini Aktif Etmek İçin:
              </h4>
              <ol className="text-sm text-info space-y-1 list-decimal list-inside">
                <li>Gmail hesabınızda 2-Factor Authentication&apos;ı aktif edin</li>
                <li>Gmail App Password oluşturun</li>
                <li>Environment variables&apos;lara GMAIL_USER ve GMAIL_APP_PASSWORD ekleyin</li>
                <li>Uygulamayı yeniden başlatın</li>
              </ol>
              <div className="mt-3">
                <a 
                  href="https://support.google.com/accounts/answer/185833" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-info hover:text-info underline"
                >
                  📚 Gmail App Password Rehberi
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
