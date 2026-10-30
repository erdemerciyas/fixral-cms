'use client';

/**
 * Üye kaydı (redesign 2026): koyu ada kart, satır içi doğrulama.
 * Başarılı kayıttan sonra giriş sayfasına `?registered=1` ile yönlendirir;
 * `?redirect=` korunur ve girişten sonra kullanılır.
 */
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { isEmail } from '@/lib/fx-quote';
import { ArrowRight } from '@/components/fx/FxIcons';
import { FxAuthCard, FxPasswordInput, safeRedirect } from '@/components/fx/FxAuthCard';

type Fields = { name: string; email: string; password: string; confirmPassword: string };

function RegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale: lang } = useAppTranslations('fx');
  const redirectUrl = safeRedirect(searchParams?.get('redirect'), `/${lang}`);

  const [f, setF] = useState<Fields>({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = `${t('auth.register.title')} | FIXRAL`; }, [t]);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const next: Partial<Record<keyof Fields, string>> = {};
    if (f.name.trim().length < 2) next.name = t('auth.register.errors.name');
    if (!isEmail(f.email)) next.email = t('auth.errors.email');
    if (f.password.length < 6) next.password = t('auth.register.errors.password');
    if (!next.password && f.password !== f.confirmPassword) next.confirmPassword = t('auth.register.errors.match');
    setErrors(next);
    const firstBad = (['name', 'email', 'password', 'confirmPassword'] as const).find((k) => next[k]);
    if (firstBad) { document.getElementById(`rg-${firstBad}`)?.focus(); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/public/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: f.name.trim(), email: f.email.trim(), password: f.password }),
      });
      if (res.status === 409) {
        setErrors({ email: t('auth.register.errors.exists') });
        document.getElementById('rg-email')?.focus();
        return;
      }
      if (!res.ok) { setFormError(t('auth.register.errors.failed')); return; }
      const q = new URLSearchParams({ registered: '1', email: f.email.trim() });
      if (redirectUrl !== `/${lang}`) q.set('callbackUrl', redirectUrl);
      router.push(`/${lang}/login?${q.toString()}`);
    } catch {
      setFormError(t('auth.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const a11y = (k: keyof Fields, extra?: string) => {
    const ids = [errors[k] ? `rg-${k}-err` : '', extra || ''].filter(Boolean).join(' ');
    return { ...(errors[k] ? { 'aria-invalid': true as const } : {}), ...(ids ? { 'aria-describedby': ids } : {}) };
  };
  const errMsg = (k: keyof Fields) => (errors[k] ? <p className="fx-field__err" id={`rg-${k}-err`}>{errors[k]}</p> : null);

  return (
    <FxAuthCard
      titleId="rg-title"
      title={t('auth.register.title')}
      lede={t('auth.register.lede')}
      foot={<>{t('auth.register.hasAccount')} <Link className="fx-link" href={`/${lang}/login${redirectUrl !== `/${lang}` ? `?callbackUrl=${encodeURIComponent(redirectUrl)}` : ''}`}>{t('auth.register.login')} <ArrowRight /></Link></>}
    >
      <form className="fx-form" onSubmit={handleSubmit} noValidate>
        <div className="fx-field">
          <label htmlFor="rg-name">{t('auth.register.name')}</label>
          <input id="rg-name" type="text" autoComplete="name" value={f.name} onChange={set('name')} maxLength={100} required aria-required="true" {...a11y('name')} />
          {errMsg('name')}
        </div>
        <div className="fx-field">
          <label htmlFor="rg-email">{t('auth.email')}</label>
          <input id="rg-email" type="email" inputMode="email" autoComplete="email" placeholder={t('auth.emailPh')} value={f.email} onChange={set('email')} maxLength={160} required aria-required="true" {...a11y('email')} />
          {errMsg('email')}
        </div>
        <div className="fx-field">
          <label htmlFor="rg-password">{t('auth.password')}</label>
          <FxPasswordInput id="rg-password" autoComplete="new-password" value={f.password} onChange={set('password')} minLength={6} required aria-required="true" showLabel={t('auth.showPassword')} hideLabel={t('auth.hidePassword')} {...a11y('password', 'rg-password-hint')} />
          <small id="rg-password-hint">{t('auth.register.passwordHint')}</small>
          {errMsg('password')}
        </div>
        <div className="fx-field">
          <label htmlFor="rg-confirmPassword">{t('auth.register.confirm')}</label>
          <FxPasswordInput id="rg-confirmPassword" autoComplete="new-password" value={f.confirmPassword} onChange={set('confirmPassword')} minLength={6} required aria-required="true" showLabel={t('auth.showPassword')} hideLabel={t('auth.hidePassword')} {...a11y('confirmPassword')} />
          {errMsg('confirmPassword')}
        </div>
        {formError && <div className="fx-notice fx-notice--err" role="alert"><span className="fx-small">{formError}</span></div>}
        <button type="submit" className="fx-btn fx-btn--primary fx-btn--block" disabled={loading} aria-busy={loading}>
          {loading ? t('auth.register.submitting') : t('auth.register.submit')} <ArrowRight />
        </button>
      </form>
    </FxAuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<section className="fx-auth" aria-busy="true"><span className="fx-spin" aria-hidden="true" /></section>}>
      <RegisterInner />
    </Suspense>
  );
}
