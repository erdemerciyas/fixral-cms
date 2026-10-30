'use client';

/**
 * Üye girişi (redesign 2026): ortada koyu ada kart; e-posta + şifre, satır içi
 * hata, "Şifremi unuttum" ile aynı kartta sıfırlama bağlantısı isteği
 * (/api/auth/forgot-password). `?callbackUrl=` ve `?registered=1` desteklenir.
 */
import { Suspense, useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { isEmail } from '@/lib/fx-quote';
import { ArrowRight } from '@/components/fx/FxIcons';
import { FxAuthCard, FxPasswordInput, safeRedirect } from '@/components/fx/FxAuthCard';

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale: lang } = useAppTranslations('fx');
  const callbackUrl = safeRedirect(searchParams?.get('callbackUrl'), `/${lang}`);
  const registered = searchParams?.get('registered') === '1';

  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState(searchParams?.get('email') || '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotState, setForgotState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const headRef = useRef(false);

  useEffect(() => {
    document.title = `${mode === 'login' ? t('auth.login.title') : t('auth.forgot.title')} | FIXRAL`;
    if (!headRef.current) { headRef.current = true; return; }
    document.getElementById(mode === 'login' ? 'lg-email' : 'fp-email')?.focus();
  }, [mode, t]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const next: typeof errors = {};
    if (!isEmail(email)) next.email = t('auth.errors.email');
    if (!password) next.password = t('auth.errors.password');
    setErrors(next);
    if (next.email || next.password) {
      document.getElementById(next.email ? 'lg-email' : 'lg-password')?.focus();
      return;
    }
    setLoading(true);
    try {
      const result = await signIn('credentials', { email: email.trim(), password, redirect: false });
      if (!result || result.error) {
        setFormError(t('auth.login.failed'));
      } else {
        toast.success(t('auth.login.success'));
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setFormError(t('auth.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) {
      setErrors({ email: t('auth.errors.email') });
      document.getElementById('fp-email')?.focus();
      return;
    }
    setErrors({});
    setForgotState('sending');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setForgotState(res.ok ? 'done' : 'error');
    } catch {
      setForgotState('error');
    }
  };

  const emailErr = errors.email ? { 'aria-invalid': true as const, 'aria-describedby': 'au-email-err' } : {};

  if (mode === 'forgot') {
    return (
      <FxAuthCard
        titleId="fp-title"
        title={t('auth.forgot.title')}
        lede={t('auth.forgot.lede')}
        foot={<button type="button" className="fx-textbtn" onClick={() => { setMode('login'); setForgotState('idle'); setErrors({}); }}>{t('auth.forgot.back')}</button>}
      >
        {forgotState === 'done' ? (
          <div className="fx-notice" role="status"><span className="fx-small">{t('auth.forgot.done')}</span></div>
        ) : (
          <form className="fx-form" onSubmit={handleForgot} noValidate>
            <div className="fx-field">
              <label htmlFor="fp-email">{t('auth.email')}</label>
              <input id="fp-email" type="email" inputMode="email" autoComplete="email" placeholder={t('auth.emailPh')} value={email} onChange={(e) => setEmail(e.target.value)} required aria-required="true" {...emailErr} />
              {errors.email && <p className="fx-field__err" id="au-email-err">{errors.email}</p>}
            </div>
            {forgotState === 'error' && <div className="fx-notice fx-notice--err" role="alert"><span className="fx-small">{t('auth.forgot.error')}</span></div>}
            <button type="submit" className="fx-btn fx-btn--primary fx-btn--block" disabled={forgotState === 'sending'} aria-busy={forgotState === 'sending'}>
              {forgotState === 'sending' ? t('auth.forgot.sending') : t('auth.forgot.submit')} <ArrowRight />
            </button>
          </form>
        )}
      </FxAuthCard>
    );
  }

  return (
    <FxAuthCard
      titleId="lg-title"
      title={t('auth.login.title')}
      lede={t('auth.login.lede')}
      foot={<>{t('auth.login.noAccount')} <Link className="fx-link" href={`/${lang}/register${callbackUrl !== `/${lang}` ? `?redirect=${encodeURIComponent(callbackUrl)}` : ''}`}>{t('auth.login.register')} <ArrowRight /></Link></>}
    >
      {registered && <div className="fx-notice" role="status"><span className="fx-small">{t('auth.login.registered')}</span></div>}
      <form className="fx-form" onSubmit={handleLogin} noValidate>
        <div className="fx-field">
          <label htmlFor="lg-email">{t('auth.email')}</label>
          <input id="lg-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder={t('auth.emailPh')} value={email} onChange={(e) => setEmail(e.target.value)} required aria-required="true" {...emailErr} />
          {errors.email && <p className="fx-field__err" id="au-email-err">{errors.email}</p>}
        </div>
        <div className="fx-field">
          <div className="fx-auth__row">
            <label htmlFor="lg-password">{t('auth.password')}</label>
            <button type="button" className="fx-textbtn" onClick={() => { setMode('forgot'); setErrors({}); setFormError(null); }}>{t('auth.login.forgot')}</button>
          </div>
          <FxPasswordInput
            id="lg-password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-required="true"
            showLabel={t('auth.showPassword')}
            hideLabel={t('auth.hidePassword')}
            {...(errors.password ? { 'aria-invalid': true, 'aria-describedby': 'lg-password-err' } : {})}
          />
          {errors.password && <p className="fx-field__err" id="lg-password-err">{errors.password}</p>}
        </div>
        {formError && <div className="fx-notice fx-notice--err" role="alert"><span className="fx-small">{formError}</span></div>}
        <button type="submit" className="fx-btn fx-btn--primary fx-btn--block" disabled={loading} aria-busy={loading}>
          {loading ? t('auth.login.submitting') : t('auth.login.submit')} <ArrowRight />
        </button>
      </form>
    </FxAuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<section className="fx-auth" aria-busy="true"><span className="fx-spin" aria-hidden="true" /></section>}>
      <LoginInner />
    </Suspense>
  );
}
