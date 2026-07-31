'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle as ExclamationTriangleIcon, RefreshCw as ArrowPathIcon, Home as HomeIcon, Sparkles as SparklesIcon } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const lang = useLocale();
  useEffect(() => {
    console.error('Application Error:', error);
    
    // In production, you might want to send to error tracking service
    // e.g., Sentry, LogRocket, etc.
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="container-narrow text-center">
        <div className="card-modern max-w-2xl mx-auto p-12">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-accent border border-primary/30 rounded-3xl flex items-center justify-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Oops! Bir Hata Oluştu
          </h1>

          {/* Error Message */}
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Beklenmeyen bir hata meydana geldi. Lütfen sayfayı yeniden yüklemeyi deneyin 
            veya ana sayfaya geri dönün.
          </p>

          {/* Error Details */}
          <div className="bg-surface-secondary rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-sm font-semibold text-foreground mb-2">Hata Detayları:</h3>
            {process.env.NODE_ENV === 'development' ? (
              <p className="text-sm text-muted-foreground font-mono break-all">
                {error.message}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Hata ayrıntıları yalnızca geliştirme ortamında gösterilir
              </p>
            )}
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Hata Kodu: {error.digest}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={reset}
              className="btn-primary flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              <span>Sayfayı Yenile</span>
            </button>
            
            <Link href={`/${lang}`} className="btn-outline flex items-center space-x-2">
              <HomeIcon className="w-5 h-5" />
              <span>Ana Sayfaya Dön</span>
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-12 p-6 bg-accent rounded-2xl border border-border">
            <div className="flex items-center space-x-3 mb-4">
              <SparklesIcon className="w-6 h-6 text-accent-foreground" />
              <h3 className="text-lg font-semibold text-accent-foreground">
                Yardıma mı İhtiyacınız Var?
              </h3>
            </div>
            <p className="text-accent-foreground mb-4">
              Sorun devam ederse, lütfen bizimle iletişime geçin. Size yardımcı olmaktan 
              memnuniyet duyarız.
            </p>
            <Link 
              href={`/${lang}/contact`} 
              className="inline-flex items-center text-accent-foreground hover:text-accent-foreground font-semibold"
            >
              İletişime Geç
              <ArrowPathIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 