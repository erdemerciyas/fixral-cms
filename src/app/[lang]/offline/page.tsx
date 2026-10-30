'use client';

/**
 * Çevrimdışı sayfası (redesign 2026) — service worker bağlantı yokken bu sayfayı
 * gösterir. Bağlantı durumu canlı izlenir; geri gelince bildirilir.
 */
import { useSyncExternalStore } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { ArrowRight } from '@/components/fx/FxIcons';
import { FxSystemPage } from '@/components/fx/FxSystem';

const subscribe = (cb: () => void) => {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
};

export default function OfflinePage() {
  const { t } = useAppTranslations('fx');
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => false);

  return (
    <FxSystemPage
      eyebrow={t('system.offline.eyebrow')}
      title={t('system.offline.title')}
      lede={t('system.offline.lede')}
      crumb={t('system.offline.eyebrow')}
      actions={
        <>
          <button type="button" className="fx-btn fx-btn--primary" onClick={() => window.location.reload()}>{t('system.offline.retry')} <ArrowRight /></button>
          <button type="button" className="fx-btn fx-btn--ghost" onClick={() => window.history.back()}>{t('system.offline.back')}</button>
        </>
      }
    >
      <div className="fx-sys-grid">
        <dl className="fx-info-list">
          <div>
            <dt><small>{t('system.offline.status')}</small></dt>
            <dd className="fx-minw0" role="status" aria-live="polite">
              <span className={`fx-sys-status ${online ? 'is-online' : ''}`}>{online ? t('system.offline.isOnline') : t('system.offline.isOffline')}</span>
            </dd>
          </div>
        </dl>
        <div className="fx-stack-22">
          <h2 className="fx-h3">{t('system.offline.tipsTitle')}</h2>
          <ul className="fx-ticks">
            <li>{t('system.offline.tip1')}</li>
            <li>{t('system.offline.tip2')}</li>
            <li>{t('system.offline.tip3')}</li>
          </ul>
        </div>
      </div>
    </FxSystemPage>
  );
}
