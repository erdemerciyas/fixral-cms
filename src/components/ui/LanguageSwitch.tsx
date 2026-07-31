'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown as ChevronDownIcon, Globe as GlobeAltIcon } from 'lucide-react';

interface Language {
  code: string;
  label: string;
  nativeLabel?: string;
  flag?: string;
}

const FALLBACK_LANGUAGES: Language[] = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
];

const ROUTE_SEGMENT_MAP: Record<string, Record<string, string>> = {
  tr: { noticias: 'haberler' },
  es: { haberler: 'noticias' },
};

let cachedLanguages: Language[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

interface LanguageSwitchProps {
  currentLang: string;
  variant?: 'default' | 'topbar' | 'compact' | 'onbrand';
  className?: string;
  /** @deprecated Use variant="compact" instead */
  compact?: boolean;
  /** Whether the parent has a dark background (subpage hero) */
  isDarkBg?: boolean;
}

export default function LanguageSwitch({
  currentLang,
  variant = 'default',
  className = '',
  compact = false,
  isDarkBg = false,
}: LanguageSwitchProps) {
  const pathname = usePathname() ?? '/';
  const [isOpen, setIsOpen] = useState(false);
  const [languages, setLanguages] = useState<Language[]>(cachedLanguages || FALLBACK_LANGUAGES);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const effectiveVariant = compact ? 'compact' : variant;

  useEffect(() => {
    if (cachedLanguages && Date.now() - cacheTimestamp < CACHE_TTL) {
      setLanguages(cachedLanguages);
      return;
    }

    let cancelled = false;

    fetch('/api/public/languages')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (cancelled || !data?.success) return;
        const langs: Language[] = (data.data || []).map((l: Record<string, unknown>) => ({
          code: l.code as string,
          label: (l.nativeLabel || l.label) as string,
          flag: (l.flag || '🌐') as string,
        }));
        if (langs.length > 0) {
          cachedLanguages = langs;
          cacheTimestamp = Date.now();
          setLanguages(langs);
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  function buildHref(targetLang: string) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return `/${targetLang}`;

    const knownCodes = languages.map((l) => l.code);
    if (knownCodes.includes(segments[0])) {
      segments[0] = targetLang;
    } else {
      segments.unshift(targetLang);
    }

    const mapping = ROUTE_SEGMENT_MAP[targetLang];
    if (mapping && segments.length >= 2 && mapping[segments[1]]) {
      segments[1] = mapping[segments[1]];
    }

    return `/${segments.join('/')}`;
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = languages.find((l) => l.code === currentLang) || languages[0];

  if (languages.length <= 1) return null;

  /* onbrand — marka renkli (turuncu) header üzerinde ghost buton */
  if (effectiveVariant === 'onbrand') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-primary-foreground/85 hover:text-primary-foreground hover:bg-white/15 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          aria-label="Dil seç"
          aria-expanded={isOpen}
        >
          <GlobeAltIcon className="w-3.5 h-3.5" />
          <span>{currentLanguage.flag}</span>
          <span className="uppercase">{currentLang}</span>
          <ChevronDownIcon className={`w-3 h-3 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-40 rounded-xl bg-popover text-popover-foreground border border-border overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-150" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.15)' }}>
            {languages.map((lang) => (
              <Link
                key={lang.code}
                href={buildHref(lang.code)}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  currentLang === lang.code
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-primary/5'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
                {currentLang === lang.code && (
                  <svg className="ml-auto h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (effectiveVariant === 'topbar') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            isDarkBg
              ? 'text-white/80 hover:text-white hover:bg-white/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
          aria-label="Dil seç"
          aria-expanded={isOpen}
        >
          <GlobeAltIcon className="w-3.5 h-3.5" />
          <span>{currentLanguage.flag}</span>
          <span className="uppercase">{currentLang}</span>
          <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-40 rounded-lg bg-popover text-popover-foreground shadow-xl border border-border overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-150">
            {languages.map((lang) => (
              <Link
                key={lang.code}
                href={buildHref(lang.code)}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  currentLang === lang.code
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
                {currentLang === lang.code && (
                  <svg className="ml-auto h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (effectiveVariant === 'compact') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Dil seç"
          aria-expanded={isOpen}
        >
          <span>{currentLanguage.flag}</span>
          <span className="uppercase">{currentLang}</span>
          <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-40 rounded-lg bg-popover text-popover-foreground shadow-xl border border-border overflow-hidden z-[60]">
            {languages.map((lang) => (
              <Link
                key={lang.code}
                href={buildHref(lang.code)}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  currentLang === lang.code
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
                {currentLang === lang.code && (
                  <svg className="ml-auto h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        aria-label="Dil seç"
        aria-expanded={isOpen}
      >
        <GlobeAltIcon className="h-4 w-4" />
        <span>{currentLanguage.flag} {currentLanguage.label}</span>
        <ChevronDownIcon className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg overflow-hidden z-[60]">
          {languages.map((lang) => (
            <Link
              key={lang.code}
              href={buildHref(lang.code)}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                currentLang === lang.code
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
              {currentLang === lang.code && (
                <svg className="ml-auto h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
