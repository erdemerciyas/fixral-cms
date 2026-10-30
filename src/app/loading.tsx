'use client';

/**
 * Rota yükleniyor durumu (redesign 2026): FX işareti üzerinde gezen turuncu
 * tarama çizgisi. Hareket azaltma tercihinde çizgi sabit durur.
 */
import { FxMark } from '@/components/fx/FxLogo';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export default function Loading() {
  const { t } = useAppTranslations('fx');
  return (
    <div className="fx-loader" role="status" aria-live="polite">
      <div className="fx-loader__mark">
        <FxMark />
        <span className="fx-loader__line" aria-hidden="true" />
      </div>
      <span className="fx-loader__label">{t('system.loading')}…</span>
    </div>
  );
}
