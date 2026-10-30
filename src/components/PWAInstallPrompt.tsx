'use client';

/**
 * PWA ana ekrana ekleme istemi ve durum göstergesi (redesign 2026).
 * Her temada koyu ada kart; metinler Türkçe. Şu an hiçbir layout'ta render edilmiyor.
 */
import { usePWAInstallPrompt, usePWA } from '@/hooks/usePWA';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { FxMark } from '@/components/fx/FxLogo';
import { CloseIcon } from '@/components/fx/FxIcons';

export default function PWAInstallPrompt() {
  const { showPrompt, handleInstall, dismissPrompt } = usePWAInstallPrompt();
  const { t } = useAppTranslations('fx');

  if (!showPrompt) return null;

  return (
    <div className="fx-pwa public-theme public-dark" role="dialog" aria-labelledby="fx-pwa-title" aria-describedby="fx-pwa-body">
      <span className="fx-pwa__icon" aria-hidden="true"><FxMark tone="light" /></span>
      <div className="fx-pwa__body">
        <span className="fx-eyebrow">{t('system.pwa.eyebrow')}</span>
        <b id="fx-pwa-title">{t('system.pwa.title')}</b>
        <p id="fx-pwa-body">{t('system.pwa.body')}</p>
        <div className="fx-pwa__acts">
          <button type="button" className="fx-btn fx-btn--primary fx-btn--sm" onClick={handleInstall}>{t('system.pwa.install')}</button>
          <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={dismissPrompt}>{t('system.pwa.later')}</button>
        </div>
      </div>
      <button type="button" className="fx-iconbtn" onClick={dismissPrompt} aria-label={t('system.pwa.close')}>
        <CloseIcon />
      </button>
    </div>
  );
}

// PWA durum göstergesi (yüklü uygulamada çevrimdışı / güncelleme bildirimi)
export function PWAStatusIndicator() {
  const { isOnline, isInstalled, updateAvailable, updateServiceWorker } = usePWA();
  const { t } = useAppTranslations('fx');

  if (!isInstalled || (isOnline && !updateAvailable)) return null;

  return (
    <div className="fx-pwa-status" role="status" aria-live="polite">
      {!isOnline && <span><span className="fx-sys-status">{t('system.pwa.offline')}</span></span>}
      {updateAvailable && (
        <button type="button" onClick={updateServiceWorker}>{t('system.pwa.update')}</button>
      )}
    </div>
  );
}
