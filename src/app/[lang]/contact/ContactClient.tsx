'use client';

/**
 * İletişim / teklif sayfası (redesign 2026) — prototip `PAGES.iletisim()`.
 * Sol: dört adımlı teklif formu (Hizmet → Parça → Dosya → İletişim), `sendQuote` ile
 * /api/public/contact'a gider. API dosya alamadığı için yalnızca dosya adları iletilir.
 * Sağ: /api/public/contact-info'dan gelen iletişim bilgileri (boş satırlar gizlenir).
 */
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHero from '@/components/common/PageHero';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { toFxLocale } from '@/content/fixral';
import { useFx } from '@/components/fx/FxData';
import { isEmail, sendQuote } from '@/lib/fx-quote';
import { ArrowRight, CloseIcon, ExternalIcon, ServiceIcon } from '@/components/fx/FxIcons';

interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  workingHours?: string;
  socialLinks?: Partial<Record<'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'github', string>>;
}

type T = (key: string, params?: Record<string, string | number>) => string;

const STEP_KEYS = ['service', 'part', 'files', 'contact'] as const;
const MATERIALS = ['unknown', 'plasticIn', 'plasticHarsh', 'metal', 'pcb'] as const;
const ACCEPT = '.stl,.step,.stp,.iges,.igs,.3mf,.obj,.jpg,.jpeg,.png,.heic,.pdf,.zip';
const MAX_FILES = 20;
/** API'nin varsayılan (Türkçe) çalışma saati metni — yerelleştirilmiş karşılığıyla gösterilir */
const DEFAULT_HOURS = 'Pazartesi - Cuma: 09:00 - 18:00';
const isPhone = (v: string) => /^\+?[\d\s().-]{7,20}$/.test(v.trim()) && (v.match(/\d/g) || []).length >= 7;

const SOCIAL: Record<string, { label: string; base: string }> = {
  linkedin: { label: 'LinkedIn', base: 'https://www.linkedin.com/in/' },
  twitter: { label: 'X', base: 'https://x.com/' },
  instagram: { label: 'Instagram', base: 'https://www.instagram.com/' },
  facebook: { label: 'Facebook', base: 'https://www.facebook.com/' },
  youtube: { label: 'YouTube', base: 'https://www.youtube.com/@' },
  github: { label: 'GitHub', base: 'https://github.com/' },
};
function socialHref(key: string, raw: string) {
  const v = raw.trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[\w-]+(\.[\w-]+)+\//.test(v)) return `https://${v}`;
  return `${SOCIAL[key]?.base || 'https://'}${v.replace(/^@/, '')}`;
}
const fmtSize = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
    </svg>
  );
}

/* --------------------------------------------------------------- Teklif formu */

function QuoteForm({ lang, t }: { lang: string; t: T }) {
  const L = toFxLocale(lang);
  const fxSvc = useFx(lang);
  const params = useSearchParams();
  const preset = useMemo(() => {
    const q = params?.get('service')?.trim();
    if (!q) return [] as string[];
    const s = fxSvc.service(q);
    return s ? [s.key] : [];
  }, [params, fxSvc]);

  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [sel, setSel] = useState<string[]>(preset);
  const [desc, setDesc] = useState('');
  const [size, setSize] = useState('');
  const [qty, setQty] = useState('');
  const [material, setMaterial] = useState<(typeof MATERIALS)[number]>('unknown');
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [over, setOver] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const navigated = useRef(false);
  const dropRef = useRef<HTMLLabelElement>(null);
  const addFilesRef = useRef<(l: FileList | null) => void>(() => {});

  // ?service= sonradan değişirse (istemci içi gezinme) ön seçimi uygula
  const [presetSeen, setPresetSeen] = useState(preset.join());
  if (preset.join() !== presetSeen) {
    setPresetSeen(preset.join());
    if (preset.length) setSel((s) => Array.from(new Set([...s, ...preset])));
  }

  useEffect(() => {
    if (!navigated.current) return;
    fieldsetRef.current?.focus();
  }, [step]);
  useEffect(() => {
    if (status === 'done') doneRef.current?.focus();
  }, [status]);

  // Sürükle-bırak: dinleyiciler doğrudan bırakma alanına bağlanır (adım 03 görünürken)
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const onOver = (e: DragEvent) => { e.preventDefault(); setOver(true); };
    const onLeave = () => setOver(false);
    const onDrop = (e: DragEvent) => { e.preventDefault(); setOver(false); addFilesRef.current(e.dataTransfer?.files || null); };
    el.addEventListener('dragover', onOver);
    el.addEventListener('dragleave', onLeave);
    el.addEventListener('drop', onDrop);
    return () => {
      el.removeEventListener('dragover', onOver);
      el.removeEventListener('dragleave', onLeave);
      el.removeEventListener('drop', onDrop);
    };
  }, [step, status]);

  const stepName = (i: number) => t(`contact.form.steps.${STEP_KEYS[i]}`);

  const validate = (i: number) => {
    const e: Record<string, string> = {};
    if (i === 1 && desc.trim().length < 10) e.desc = t('contact.form.errors.desc');
    if (i === 3) {
      if (name.trim().length < 2) e.name = t('contact.form.errors.name');
      if (!isEmail(email)) e.email = t('contact.form.errors.email');
      if (phone.trim() && !isPhone(phone)) e.phone = t('contact.form.errors.phone');
    }
    return e;
  };

  const focusField = (id: string) => {
    window.requestAnimationFrame(() => document.getElementById(`cq-${id}`)?.focus());
  };

  const goTo = (target: number) => {
    if (target === step) return;
    if (target > step) {
      for (let i = step; i < target; i++) {
        const e = validate(i);
        if (Object.keys(e).length) {
          navigated.current = true;
          if (i !== step) setStep(i);
          setErrors(e);
          focusField(Object.keys(e)[0]);
          return;
        }
      }
    }
    navigated.current = true;
    setErrors({});
    setStep(target);
    setFurthest((f) => Math.max(f, target));
  };

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    // FileList canlıdır (input temizlenince boşalır); önce kopyalanır
    const incoming = Array.from(list);
    setFiles((cur) => {
      const next = [...cur];
      incoming.forEach((f) => {
        if (next.length < MAX_FILES && !next.some((x) => x.name === f.name && x.size === f.size)) next.push({ name: f.name, size: f.size });
      });
      return next;
    });
  };

  useEffect(() => { addFilesRef.current = addFiles; });

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (status === 'sending') return;
    if (step < 3) { goTo(step + 1); return; }
    const e1 = validate(1);
    if (Object.keys(e1).length) {
      navigated.current = true;
      setStep(1);
      setErrors(e1);
      focusField('desc');
      return;
    }
    const e3 = validate(3);
    setErrors(e3);
    if (Object.keys(e3).length) { focusField(Object.keys(e3)[0]); return; }
    setStatus('sending');
    const res = await sendQuote({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      services: sel.map((k) => fxSvc.service(k)?.text.tr.name || k),
      quantity: qty.trim() || undefined,
      size: size.trim() || undefined,
      material: material === 'unknown' ? undefined : t(`contact.form.materials.${material}`),
      message: desc.trim(),
      files: files.map((f) => f.name),
      source: 'contact',
    });
    setStatus(res.ok ? 'done' : 'error');
  };

  const reset = () => {
    setSel([]); setDesc(''); setSize(''); setQty(''); setMaterial('unknown'); setFiles([]);
    setName(''); setEmail(''); setPhone(''); setErrors({}); setStatus('idle');
    navigated.current = true; setStep(0); setFurthest(0);
  };

  const err = (id: string) => (errors[id] ? { 'aria-invalid': true as const, 'aria-describedby': `cq-${id}-err` } : {});
  const errMsg = (id: string) => (errors[id] ? <p className="fx-field__err" id={`cq-${id}-err`}>{errors[id]}</p> : null);

  if (status === 'done') {
    return (
      <div className="fx-qform fx-qform__done">
        <div className="fx-notice fx-notice--ok" role="status" tabIndex={-1} ref={doneRef}>
          <b>{t('contact.form.doneTitle')}</b>
          <span className="fx-small fx-muted">{t('contact.form.doneBody')}</span>
          {files.length > 0 && <span className="fx-small fx-muted">{t('contact.form.doneFiles')}</span>}
        </div>
        <button type="button" className="fx-btn fx-btn--ghost" onClick={reset}>{t('contact.form.again')}</button>
      </div>
    );
  }

  return (
    <form className="fx-form fx-qform" onSubmit={submit} noValidate aria-label={t('contact.form.label')}>
      <nav aria-label={t('contact.form.stepsLabel')}>
        <ol className="fx-steps-nav">
          {STEP_KEYS.map((k, i) => (
            <li key={k}>
              <button
                type="button"
                aria-current={i === step ? 'step' : undefined}
                className={i !== step && i <= furthest ? 'done' : undefined}
                onClick={() => goTo(i)}
              >
                <span className="fx-steps-nav__no">{String(i + 1).padStart(2, '0')}</span>
                {stepName(i)}
                {i !== step && i < furthest && <span className="sr-only"> ({t('contact.form.done')})</span>}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <fieldset className="fx-fstep" ref={fieldsetRef} tabIndex={-1} aria-describedby={Object.keys(errors).length ? 'cq-summary' : undefined}>
        <legend className="sr-only">{t('contact.form.stepOf', { n: step + 1, total: STEP_KEYS.length, name: stepName(step) })}</legend>

        {step === 0 && (
          <div className="fx-field" role="group" aria-labelledby="cq-svc-lbl" aria-describedby="cq-svc-hint">
            <span className="fx-lbl" id="cq-svc-lbl">{t('contact.form.servicesLabel')}</span>
            <small id="cq-svc-hint">{t('contact.form.servicesHint')}</small>
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
          </div>
        )}

        {step === 1 && (
          <>
            <div className="fx-field">
              <label htmlFor="cq-desc">{t('contact.form.desc')}</label>
              <textarea id="cq-desc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t('contact.form.descPh')} maxLength={1500} required aria-required="true" {...err('desc')} />
              {errMsg('desc')}
            </div>
            <div className="fx-row2">
              <div className="fx-field">
                <label htmlFor="cq-size">{t('contact.form.size')} <span className="fx-req">{t('contact.form.optional')}</span></label>
                <input id="cq-size" type="text" value={size} onChange={(e) => setSize(e.target.value)} placeholder={t('contact.form.sizePh')} maxLength={80} />
              </div>
              <div className="fx-field">
                <label htmlFor="cq-qty">{t('contact.form.qty')} <span className="fx-req">{t('contact.form.optional')}</span></label>
                <input id="cq-qty" type="text" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="1" maxLength={20} />
              </div>
            </div>
            <div className="fx-field">
              <label htmlFor="cq-mat">{t('contact.form.material')}</label>
              <select id="cq-mat" value={material} onChange={(e) => setMaterial(e.target.value as (typeof MATERIALS)[number])}>
                {MATERIALS.map((m) => <option key={m} value={m}>{t(`contact.form.materials.${m}`)}</option>)}
              </select>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <label className={`fx-drop ${over ? 'is-over' : ''}`} htmlFor="cq-file" ref={dropRef}>
              <input id="cq-file" type="file" multiple accept={ACCEPT} aria-describedby="cq-file-note" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
              <UploadIcon />
              <b>{t('contact.form.dropTitle')}</b>
              <span className="fx-small">{t('contact.form.dropHint')}</span>
            </label>
            <p className="fx-notice fx-small" id="cq-file-note">{t('contact.form.filesNote')}</p>
            {files.length > 0 && (
              <div className="fx-field">
                <span className="fx-lbl" id="cq-files-lbl">{t('contact.form.filesChosen')} <span className="fx-req fx-mono">· {files.length}</span></span>
                <ul className="fx-filelist" aria-labelledby="cq-files-lbl">
                  {files.map((f) => (
                    <li key={`${f.name}-${f.size}`} className="fx-filechip">
                      <span>{f.name}</span>
                      <small>{fmtSize(f.size)}</small>
                      <button type="button" aria-label={t('contact.form.removeFile', { name: f.name })} onClick={() => setFiles((cur) => cur.filter((x) => x !== f))}>
                        <CloseIcon />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="fx-fstep__lede">{t('contact.form.photoTip')}</p>
          </>
        )}

        {step === 3 && (
          <>
            <div className="fx-row2">
              <div className="fx-field">
                <label htmlFor="cq-name">{t('contact.form.name')}</label>
                <input id="cq-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required aria-required="true" {...err('name')} />
                {errMsg('name')}
              </div>
              <div className="fx-field">
                <label htmlFor="cq-email">{t('contact.form.email')}</label>
                <input id="cq-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('contact.form.emailPh')} maxLength={160} required aria-required="true" {...err('email')} />
                {errMsg('email')}
              </div>
            </div>
            <div className="fx-field">
              <label htmlFor="cq-phone">{t('contact.form.phone')} <span className="fx-req">{t('contact.form.optional')}</span></label>
              <input id="cq-phone" type="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={24} {...err('phone')} />
              {errMsg('phone')}
            </div>
          </>
        )}
      </fieldset>

      {Object.keys(errors).length > 0 && <p className="sr-only" id="cq-summary" role="alert">{t('contact.form.errors.summary')}</p>}

      <div className="fx-form-actions">
        {step > 0 && (
          <button type="button" className="fx-btn fx-btn--ghost" onClick={() => goTo(step - 1)}>{t('contact.form.back')}</button>
        )}
        <button type="submit" className="fx-btn fx-btn--primary" disabled={status === 'sending'} aria-busy={status === 'sending'}>
          {step < 3 ? t('contact.form.next') : status === 'sending' ? t('contact.form.sending') : t('contact.form.submit')} <ArrowRight />
        </button>
      </div>

      {status === 'error' && (
        <div className="fx-notice fx-notice--err" role="alert">
          <b>{t('contact.form.errorTitle')}</b>
          <span className="fx-small fx-muted">{t('contact.form.errorBody')}</span>
        </div>
      )}
    </form>
  );
}

/* ----------------------------------------------------------- İletişim bilgisi */

function InfoList({ t }: { t: T }) {
  const [info, setInfo] = useState<ContactInfo | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    let off = false;
    fetch('/api/public/contact-info')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: ContactInfo) => { if (!off) { setInfo(data); setState('ok'); } })
      .catch(() => { if (!off) setState('error'); });
    return () => { off = true; };
  }, []);

  const email = info?.email?.trim();
  const phone = info?.phone?.trim();
  const address = info?.address?.trim();
  const hours = info?.workingHours?.trim();
  const socials = Object.entries(info?.socialLinks || {})
    .map(([k, v]) => ({ key: k, label: SOCIAL[k]?.label || k, href: socialHref(k, String(v || '')) }))
    .filter((s) => s.href);
  const newTab = <span className="sr-only"> ({t('contact.info.newTab')})</span>;

  return (
    <aside className="fx-contact-aside" aria-label={t('contact.info.label')}>
      <div className="fx-info-list" aria-busy={state === 'loading'}>
        {state === 'loading' && (
          <>
            <span className="sr-only" role="status">{t('contact.info.loading')}</span>
            {[0, 1, 2].map((i) => (
              <div key={i} className="fx-info-list__skel" aria-hidden="true">
                <span className="fx-skel-line fx-skel-line--short" />
                <span className="fx-skel-line fx-skel-line--mid" />
              </div>
            ))}
          </>
        )}
        {state === 'ok' && (
          <>
            {email && (
              <div>
                <small>{t('contact.info.email')}</small>
                <a className="fx-mono" href={`mailto:${email}`}>{email}</a>
              </div>
            )}
            {phone && (
              <div>
                <small>{t('contact.info.phone')}</small>
                <a className="fx-mono" href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
              </div>
            )}
            {address && (
              <div>
                <small>{t('contact.info.address')}</small>
                <address><span>{address}</span></address>
                <span className="fx-inline-links">
                  <a className="fx-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer">
                    {t('contact.info.map')} <ExternalIcon />{newTab}
                  </a>
                  <a className="fx-link" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer">
                    {t('contact.info.directions')} <ExternalIcon />{newTab}
                  </a>
                </span>
              </div>
            )}
            {hours && (
              <div>
                <small>{t('contact.info.hours')}</small>
                <span>{hours === DEFAULT_HOURS ? t('contact.info.hoursDefault') : hours}</span>
              </div>
            )}
          </>
        )}
        <div>
          <small>{t('contact.info.response')}</small>
          <span>{t('contact.info.responseValue')}</span>
        </div>
        {state === 'ok' && socials.length > 0 && (
          <div>
            <small>{t('contact.info.channels')}</small>
            <span className="fx-inline-links">
              {socials.map((s) => (
                <a key={s.key} className="fx-link" href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}{newTab}
                </a>
              ))}
            </span>
          </div>
        )}
      </div>
      {state === 'error' && (
        <p className="fx-empty fx-small" role="status">{t('contact.info.unavailable')}</p>
      )}
    </aside>
  );
}

/* ---------------------------------------------------------------------- Sayfa */

export default function ContactClient({ lang }: { lang: string }) {
  const { t } = useAppTranslations('fx');
  const head = useFx(lang).page('contact');
  return (
    <>
      <PageHero
        badge={head.eyebrow || t('contact.hero.eyebrow')}
        title={head.title || t('contact.hero.title')}
        description={head.lede || t('contact.hero.lede')}
      />
      <section className="fx-sec fx-sec--tight">
        <div className="fx-wrap fx-contact-grid">
          <Suspense fallback={<div className="fx-loadrow" role="status"><span className="fx-spin" aria-hidden="true" />{t('common.loading')}</div>}>
            <QuoteForm lang={lang} t={t} />
          </Suspense>
          <InfoList t={t} />
        </div>
      </section>
    </>
  );
}
