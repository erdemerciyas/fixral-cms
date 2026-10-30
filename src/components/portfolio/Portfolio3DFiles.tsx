'use client';

/**
 * 3D model dosya listesi (redesign 2026): biçim, ad, boyut ve
 * indirilebilir dosyalar için indirme düğmesi (/api/public/3dmodels/download).
 */
import { useState } from 'react';
import { usePfT } from './usePfT';
import type { PfModel3D } from './portfolio-data';

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
);

export default function Portfolio3DFiles({ models3D }: { models3D: PfModel3D[] }) {
  const t = usePfT();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(false);

  if (!models3D || models3D.length === 0) return null;

  const download = async (model: PfModel3D) => {
    if (!model.downloadable) return;
    setBusy(model.url);
    setError(false);
    try {
      const res = await fetch(`/api/public/3dmodels/download?url=${encodeURIComponent(model.url)}&filename=${encodeURIComponent(model.name)}`);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = model.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (e) {
      console.error('3D model download failed:', e);
      setError(true);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fx-pf-files">
      <h3 className="fx-pf-lbl">{t('viewer.files')}</h3>
      <ul>
        {models3D.map((model, i) => (
          <li key={model._id || `${model.url}-${i}`}>
            <span className="fx-badge">{model.format.toUpperCase()}</span>
            <span className="fx-pf-files__name">{model.name}</span>
            {model.size ? <span className="fx-tag">{formatFileSize(model.size)}</span> : <span />}
            {model.downloadable ? (
              <button
                type="button"
                className="fx-btn fx-btn--ghost fx-btn--sm"
                onClick={() => download(model)}
                disabled={busy === model.url}
                aria-label={t('viewer.downloadName', { name: model.name })}
              >
                <DownloadIcon />
                {busy === model.url ? t('viewer.downloading') : t('viewer.download')}
              </button>
            ) : <span />}
          </li>
        ))}
      </ul>
      {error && <p className="fx-form__err" role="alert">{t('viewer.downloadError')}</p>}
    </div>
  );
}
