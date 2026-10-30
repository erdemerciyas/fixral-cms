'use client';

/**
 * Sağ kenarda sabit "Teklif Al" kulakçığı (redesign 2026). Teklif modalını
 * `openProjectModal` olayıyla açar. Şu an hiçbir layout'ta render edilmiyor;
 * kullanılırsa marka sistemine uygun görünür (yalnızca ≥768px).
 */
import { useSyncExternalStore } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { ArrowRight } from '@/components/fx/FxIcons';

// Mount bilgisini efekt olmadan türet (server'da false, client'ta true)
const subscribeNoop = () => () => {};

type GtagFn = (command: 'event', eventName: string, params?: Record<string, unknown>) => void;

export default function FloatingCta() {
  const isMounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const { t } = useAppTranslations('fx');

  const handleClick = () => {
    const w = window as typeof window & { gtag?: GtagFn };
    w.gtag?.('event', 'open_project_modal', { location: 'floating_cta' });
    window.dispatchEvent(new Event('openProjectModal'));
  };

  if (!isMounted) return null;

  return (
    <div className="fx-tabcta">
      <button type="button" className="fx-btn fx-btn--primary" onClick={handleClick} aria-haspopup="dialog" aria-label={t('system.cta.label')}>
        {t('system.cta.text')} <ArrowRight />
      </button>
    </div>
  );
}
