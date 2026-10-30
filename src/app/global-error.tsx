'use client';

/**
 * Kök hata sınırı (redesign 2026). Kök layout'un yerine geçtiği için globals.css,
 * yazı tipleri ve Header/Footer yüklenmez: kendi <html>/<body>'si ve gömülü
 * stilleriyle tek başına çalışır. Marka paleti sabit değerlerle (koyu ada) yazılır.
 */
import { useEffect } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';

const CSS = `
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0;background:#101828;color:#F3F4F6;color-scheme:dark}
body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:16px;line-height:1.5;-webkit-font-smoothing:antialiased;min-height:100vh;min-height:100dvh;display:flex;flex-direction:column}
.ge-top{border-bottom:1px solid #253047;padding:18px max(16px,env(safe-area-inset-left))}
.ge-top svg{height:22px;width:auto;display:block}
.ge-main{flex:1;display:flex;align-items:center;padding:clamp(48px,8vw,104px) max(16px,env(safe-area-inset-right)) clamp(48px,8vw,104px) max(16px,env(safe-area-inset-left));background:radial-gradient(100% 120% at 85% 0%,#18233A,#101828 55%)}
.ge-in{width:100%;max-width:1280px;margin:0 auto;display:grid;gap:22px}
@media(min-width:900px){.ge-main,.ge-top{padding-left:32px;padding-right:32px}}
.ge-eyebrow{margin:0;font-family:"Space Grotesk",Inter,ui-sans-serif,system-ui,sans-serif;font-weight:500;font-size:12px;line-height:16px;letter-spacing:.16em;text-transform:uppercase;color:#FB923C}
h1{margin:0;font-family:"Space Grotesk",Inter,ui-sans-serif,system-ui,sans-serif;font-weight:700;font-size:clamp(36px,5vw,64px);line-height:1.02;letter-spacing:-.02em;max-width:18ch;text-wrap:balance}
.ge-lede{margin:0;max-width:62ch;font-size:clamp(17px,1.4vw,19px);line-height:1.6;color:#9CA3AF}
.ge-code{margin:0;font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;color:#9CA3AF;overflow-wrap:anywhere}
.ge-code b{color:#F3F4F6;font-weight:400}
.ge-actions{display:flex;flex-wrap:wrap;gap:12px;padding-top:8px}
.ge-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:48px;padding:12px 22px;border-radius:8px;font:inherit;font-weight:500;text-decoration:none;border:1px solid transparent;cursor:pointer}
.ge-btn svg{width:18px;height:18px}
.ge-btn--primary{background:#F97316;color:#101828}
.ge-btn--primary:hover{background:#FB8A3C}
.ge-btn--ghost{background:transparent;color:#F3F4F6;border-color:#3B475C}
.ge-btn--ghost:hover{border-color:#9CA3AF}
.ge-btn:focus-visible{outline:2px solid #F97316;outline-offset:2px}
`;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t, locale } = useAppTranslations('fx');
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang={locale}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#101828" />
        <title>{`${t('system.error.eyebrow')} | FIXRAL`}</title>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </head>
      <body>
        <header className="ge-top">
          <svg viewBox="0 0 364 180" role="img" aria-label="FIXRAL">
            <path fill="#FFFFFF" d="M0 30L30 0H172L256 90L172 180H106L190 90L145.2 42H48V76H159.4L122.1 116H48V180H0Z" />
            <path fill="#F97316" d="M283 0H364L280 84H272L238 52Z" />
            <path fill="#F97316" d="M283 180H364L280 96H272L238 128Z" />
          </svg>
        </header>
        <main className="ge-main">
          <div className="ge-in">
            <p className="ge-eyebrow">{t('system.error.eyebrow')}</p>
            <h1>{t('system.error.title')}</h1>
            <p className="ge-lede">{t('system.error.lede')}</p>
            {error.digest && (
              <p className="ge-code">{t('system.error.code')}: <b>{error.digest}</b></p>
            )}
            <div className="ge-actions">
              <button type="button" className="ge-btn ge-btn--primary" onClick={reset}>
                {t('system.error.retry')}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
              {/* global-error kök layout'un yerine geçer; next/link yerine tam sayfa yüklemesi bilerek kullanılır */}
              <a className="ge-btn ge-btn--ghost" href={`/${locale}`}>{t('system.home')}</a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
