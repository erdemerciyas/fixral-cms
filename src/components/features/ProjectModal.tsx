'use client';

/**
 * Teklif modalı (redesign 2026) — başlıktaki "Teklif Al" ve `openProjectModal`
 * window olayıyla açılır. Her temada koyu ada diyaloğu; hizmet çipleri, ad,
 * e-posta, telefon, adet ve kısa açıklama. `sendQuote` (source 'modal') ile gönderir.
 * [lang] intl sağlayıcısının dışında render edildiği için useAppTranslations kullanır.
 */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { toFxLocale } from '@/content/fixral';
import { useFx } from '@/components/fx/FxData';
import { isEmail, sendQuote } from '@/lib/fx-quote';
import { ArrowRight, CloseIcon, ServiceIcon } from '@/components/fx/FxIcons';
import { useFxDialog } from '@/components/fx/useFxDialog';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mount bilgisini efekt olmadan türet (server'da false, client'ta true)
const subscribeNoop = () => () => {};
const isPhone = (v: string) => /^\+?[\d\s().-]{7,20}$/.test(v.trim()) && (v.match(/\d/g) || []).length >= 7;
const AUTO_CLOSE_MS = 3200;

type Fields = { name: string; email: string; phone: string; qty: string; msg: string };
const EMPTY: Fields = { name: '', email: '', phone: '', qty: '', msg: '' };

export default function ProjectModal({ isOpen, onClose }: ProjectModalProps) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  if (!mounted || !isOpen) return null;
  return createPortal(<QuoteDialog onClose={onClose} />, document.body);
}

function QuoteDialog({ onClose }: { onClose: () => void }) {
  const { t, locale } = useAppTranslations('fx');
  const L = toFxLocale(locale);
  const fxSvc = useFx(locale);
  const panelRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<string[]>([]);
  const [f, setF] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const scrimRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);

  const close = useCallback(() => onClose(), [onClose]);
  // Açılışta odak diyaloğun kendisine verilir: ekran okuyucu başlık + açıklamayı okur
  useFxDialog(true, close, panelRef, panelRef);

  // Zemin tıklaması kapatır (sürükleyerek seçim yaparken yanlışlıkla kapanmasın diye
  // basma ve bırakma ikisi de zeminde olmalı). Klavye için Escape ve Kapat düğmesi var.
  useEffect(() => { sendingRef.current = status === 'sending'; }, [status]);
  useEffect(() => {
    const el = scrimRef.current;
    if (!el) return;
    let down = false;
    const onDown = (e: MouseEvent) => { down = e.target === el; };
    const onUp = (e: MouseEvent) => { if (down && e.target === el && !sendingRef.current) close(); down = false; };
    el.addEventListener('mousedown', onDown);
    el.addEventListener('mouseup', onUp);
    return () => { el.removeEventListener('mousedown', onDown); el.removeEventListener('mouseup', onUp); };
  }, [close]);

  useEffect(() => {
    if (status !== 'done') return;
    doneRef.current?.focus();
    const timer = window.setTimeout(close, AUTO_CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [status, close]);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    const next: Partial<Record<keyof Fields, string>> = {};
    if (f.name.trim().length < 2) next.name = t('quote.nameRequired');
    if (!isEmail(f.email)) next.email = t('quote.emailInvalid');
    if (f.phone.trim() && !isPhone(f.phone)) next.phone = t('contact.modal.phoneInvalid');
    if (f.msg.trim().length < 10) next.msg = t('contact.modal.msgRequired');
    setErrors(next);
    const firstBad = (['name', 'email', 'phone', 'msg'] as const).find((k) => next[k]);
    if (firstBad) { document.getElementById(`fxpm-${firstBad}`)?.focus(); return; }
    setStatus('sending');
    const res = await sendQuote({
      name: f.name.trim(),
      email: f.email.trim(),
      phone: f.phone.trim() || undefined,
      quantity: f.qty.trim() || undefined,
      services: sel.map((k) => fxSvc.service(k)?.text.tr.name || k),
      message: f.msg.trim(),
      source: 'modal',
    });
    setStatus(res.ok ? 'done' : 'error');
  };

  const err = (k: keyof Fields) => (errors[k] ? { 'aria-invalid': true as const, 'aria-describedby': `fxpm-${k}-err` } : {});
  const errMsg = (k: keyof Fields) => (errors[k] ? <p className="fx-field__err" id={`fxpm-${k}-err`}>{errors[k]}</p> : null);

  return (
    <div className="fx-dialog-scrim" ref={scrimRef}>
      <div
        ref={panelRef}
        className="fx-dialog public-theme public-dark"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fxpm-title"
        aria-describedby="fxpm-lede"
        tabIndex={-1}
      >
        <div className="fx-dialog__head">
          <div>
            <p className="fx-eyebrow">{t('contact.modal.eyebrow')}</p>
            <h2 className="fx-dialog__title" id="fxpm-title">{t('contact.modal.title')}</h2>
            <p className="fx-small fx-muted" id="fxpm-lede">{t('contact.modal.lede')}</p>
          </div>
          <button type="button" className="fx-iconbtn" onClick={close} aria-label={t('contact.modal.close')}>
            <CloseIcon />
          </button>
        </div>

        <div className="fx-dialog__body">
          {status === 'done' ? (
            <div className="fx-notice" role="status" tabIndex={-1} ref={doneRef}>
              <b>{t('quote.done')}</b>
              <span className="fx-small fx-muted">{t('quote.doneBody')}</span>
              <span className="fx-small fx-muted">{t('contact.modal.closing')}</span>
            </div>
          ) : (
            <form className="fx-form" onSubmit={submit} noValidate>
              <fieldset className="fx-field fx-fieldset">
                <legend className="fx-lbl">{t('quote.need')}</legend>
                <div className="fx-chips">
                  {fxSvc.services.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      className="fx-chip"
                      aria-pressed={sel.includes(s.key)}
                      onClick={() => setSel((cur) => (cur.includes(s.key) ? cur.filter((x) => x !== s.key) : [...cur, s.key]))}
                    >
                      <ServiceIcon name={s.icon} />
                      {s.text[L].name}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="fx-row2">
                <div className="fx-field">
                  <label htmlFor="fxpm-name">{t('quote.name')}</label>
                  <input id="fxpm-name" autoComplete="name" value={f.name} onChange={set('name')} maxLength={100} required aria-required="true" {...err('name')} />
                  {errMsg('name')}
                </div>
                <div className="fx-field">
                  <label htmlFor="fxpm-email">{t('quote.email')}</label>
                  <input id="fxpm-email" type="email" inputMode="email" autoComplete="email" placeholder={t('quote.emailPh')} value={f.email} onChange={set('email')} maxLength={160} required aria-required="true" {...err('email')} />
                  {errMsg('email')}
                </div>
              </div>
              <div className="fx-row2">
                <div className="fx-field">
                  <label htmlFor="fxpm-phone">{t('contact.modal.phone')} <span className="fx-req">{t('contact.modal.optional')}</span></label>
                  <input id="fxpm-phone" type="tel" inputMode="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} maxLength={24} {...err('phone')} />
                  {errMsg('phone')}
                </div>
                <div className="fx-field">
                  <label htmlFor="fxpm-qty">{t('quote.qty')} <span className="fx-req">{t('contact.modal.optional')}</span></label>
                  <input id="fxpm-qty" inputMode="numeric" placeholder="1" value={f.qty} onChange={set('qty')} maxLength={20} />
                </div>
              </div>
              <div className="fx-field">
                <label htmlFor="fxpm-msg">{t('quote.msg')}</label>
                <textarea id="fxpm-msg" placeholder={t('quote.msgPh')} value={f.msg} onChange={set('msg')} maxLength={1500} required aria-required="true" {...err('msg')} />
                {errMsg('msg')}
              </div>
              {status === 'error' && (
                <div className="fx-notice fx-notice--err" role="alert"><b>{t('quote.error')}</b></div>
              )}
              <div className="fx-form-actions">
                <Link className="fx-link" href={`/${L}/contact`} onClick={close}>{t('quote.more')} <ArrowRight /></Link>
                <div className="fx-dialog__actions">
                  <button type="button" className="fx-btn fx-btn--ghost" onClick={close}>{t('contact.modal.cancel')}</button>
                  <button type="submit" className="fx-btn fx-btn--primary" disabled={status === 'sending'} aria-busy={status === 'sending'}>
                    {status === 'sending' ? t('quote.sending') : t('contact.modal.submit')} <ArrowRight />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
