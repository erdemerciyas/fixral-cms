'use client';
import Link from 'next/link';
import { Search as MagnifyingGlassIcon, Home as HomeIcon, ArrowLeft as ArrowLeftIcon, Sparkles as SparklesIcon, AlertCircle as ExclamationCircleIcon } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';

export default function NotFound() {
  const lang = useLocale();
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = `/${lang}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="container-narrow text-center">
        <div className="card-modern max-w-2xl mx-auto p-12">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative">
              {/* Main 404 number */}
              <div className="text-8xl sm:text-9xl font-black text-gradient mb-4">
                404
              </div>
              
              {/* Floating icons */}
              <div className="absolute top-0 left-1/4 w-12 h-12 bg-gradient-to-br from-primary to-primary rounded-2xl flex items-center justify-center animate-bounce">
                <ExclamationCircleIcon className="w-6 h-6 text-white" />
              </div>
              
              <div className="absolute top-8 right-1/4 w-10 h-10 bg-gradient-to-br from-primary to-primary rounded-xl flex items-center justify-center animate-pulse">
                <MagnifyingGlassIcon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Sayfa Bulunamadı
          </h1>

          {/* Error Message */}
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir. 
            Ana sayfaya dönerek gezinmeye devam edebilirsiniz.
          </p>

          {/* Search Suggestions */}
          <div className="bg-surface-secondary rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Bunları Deneyebilirsiniz:
            </h3>
            <ul className="text-muted-foreground space-y-2 text-left">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>URL&apos;yi kontrol edin</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Ana sayfaya geri dönün</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Navigasyon menüsünü kullanın</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Arama yapın</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={`/${lang}`} className="btn-primary flex items-center space-x-2">
              <HomeIcon className="w-5 h-5" />
              <span>Ana Sayfaya Dön</span>
            </Link>
            
            <button 
              onClick={handleGoBack}
              className="btn-outline flex items-center space-x-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Geri Dön</span>
            </button>
          </div>

          {/* Popular Pages */}
          <div className="mt-12 p-6 bg-gradient-to-br from-accent to-accent rounded-2xl border border-border">
            <div className="flex items-center space-x-3 mb-4">
              <SparklesIcon className="w-6 h-6 text-accent-foreground" />
              <h3 className="text-lg font-semibold text-accent-foreground">
                Popüler Sayfalar
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link 
                href={`/${lang}/services`} 
                className="text-accent-foreground hover:text-accent-foreground font-medium p-2 rounded-lg hover:bg-accent transition-colors"
              >
                Hizmetlerimiz
              </Link>
              <Link 
                href={`/${lang}/portfolio`} 
                className="text-accent-foreground hover:text-accent-foreground font-medium p-2 rounded-lg hover:bg-accent transition-colors"
              >
                Portfolyo
              </Link>
              <Link 
                href={`/${lang}/about`} 
                className="text-accent-foreground hover:text-accent-foreground font-medium p-2 rounded-lg hover:bg-accent transition-colors"
              >
                Hakkımızda
              </Link>
              <Link 
                href={`/${lang}/contact`} 
                className="text-accent-foreground hover:text-accent-foreground font-medium p-2 rounded-lg hover:bg-accent transition-colors"
              >
                İletişim
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 