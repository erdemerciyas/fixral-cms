'use client';

import { Send as PaperAirplaneIcon } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';

// Mount bilgisini efekt olmadan türet (server'da false, client'ta true)
const subscribeNoop = () => () => {};

export default function FloatingCta() {
  const isMounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [isOpen, setIsOpen] = useState(false);

  // İlk yüklemede kulakçığı otomatik aç-kapa (reduced motion değilse)
  useEffect(() => {
    if (!isMounted) return;
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const openTimer = setTimeout(() => setIsOpen(true), 300); // hafif gecikme
    const closeTimer = setTimeout(() => setIsOpen(false), 2400); // kısa gösterim
    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };
  }, [isMounted]);

  // GA4 güvenli çağrı yardımcıları (tipli)
  type GtagFn = (command: 'event', eventName: string, params?: Record<string, unknown>) => void;
  const getGtag = (): GtagFn | undefined => {
    if (typeof window === 'undefined') return undefined;
    const w = window as typeof window & { gtag?: GtagFn };
    return w.gtag;
  };
  const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
    const gtag = getGtag();
    if (gtag) {
      gtag('event', eventName, params);
    }
  };

  const handleClick = () => {
    // GA4: CTA tıklandığında modal açılma niyeti
    trackEvent('open_project_modal', {
      location: 'floating_cta',
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('openProjectModal'));
    }
  };

  if (!isMounted) return null;

  return (
    <div className="hidden md:block fixed right-0 top-[42%] -translate-y-1/2 z-60" style={{ right: 'max(0px, env(safe-area-inset-right))' }}>
      <button
        onClick={handleClick}
        aria-label="Proje başvurusu formunu aç"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`group relative isolate overflow-hidden flex items-center h-16 ${isOpen ? 'w-56' : 'w-14'} hover:w-56 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out ${isOpen ? 'translate-x-0' : 'translate-x-3'} hover:translate-x-0 rounded-l-xs bg-primary text-primary-foreground shadow-[var(--shadow-lg)] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
      >
        {/* İnce iç hat */}
        <span aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute inset-0 rounded-l-xs ring-1 ring-primary-foreground/10" />
        </span>

        {/* Kulak gövdesi – dar başlangıç, hover’da yazı belirir */}
        <div className="relative z-10 flex items-center gap-2 px-3">
          <PaperAirplaneIcon className="w-5 h-5 motion-safe:transition-transform motion-safe:duration-300 group-hover:translate-x-0.5" />
          <span className={`font-semibold whitespace-nowrap overflow-hidden ${isOpen ? 'max-w-44' : 'max-w-0'} group-hover:max-w-44 motion-safe:transition-all`}>Proje Başvurusu</span>
        </div>
      </button>
    </div>
  );
}
