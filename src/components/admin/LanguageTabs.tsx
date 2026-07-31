'use client';

import React from 'react';
import Link from 'next/link';
import type { Language } from '@/types/language';
import { AlertTriangle as ExclamationTriangleIcon, Languages as LanguageIcon } from 'lucide-react';

interface LanguageTabsProps {
  languages: Language[];
  activeLanguage: string;
  onLanguageChange: (code: string) => void;
  translations?: Record<string, any>;
  error?: string | null;
}

export default function LanguageTabs({
  languages,
  activeLanguage,
  onLanguageChange,
  translations,
  error,
}: LanguageTabsProps) {
  // Show error state
  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center space-x-3">
        <ExclamationTriangleIcon className="w-5 h-5 text-destructive shrink-0" />
        <div>
          <p className="text-sm font-medium text-destructive">Diller yüklenemedi</p>
          <p className="text-xs text-destructive mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state with link to language settings
  if (languages.length === 0) {
    return (
      <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-start space-x-3">
        <LanguageIcon className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-warning">Henüz dil tanımlanmamış</p>
          <p className="text-xs text-warning mt-1">
            Çoklu dil desteği için önce dil ayarlarından en az bir dil eklemeniz gerekiyor.
          </p>
          <Link
            href="/admin/languages"
            className="inline-flex items-center mt-2 text-xs font-semibold text-warning bg-warning/15 hover:bg-warning/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            Dil Ayarlarına Git →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-xs border border-border overflow-hidden">
      <div className="flex border-b border-border">
        {languages.map((lang) => {
          const isActive = activeLanguage === lang.code;
          const hasContent = translations?.[lang.code]?.title?.trim();

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => onLanguageChange(lang.code)}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeLabel}</span>
              {lang.isDefault && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  Varsayılan
                </span>
              )}
              {translations && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    hasContent
                      ? 'bg-success'
                      : isActive
                        ? 'bg-primary-foreground/40'
                        : 'bg-muted'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
