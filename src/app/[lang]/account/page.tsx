'use client';

/**
 * Hesabım (redesign 2026): kompakt PageHero + alt çizgili sekmeler
 * (Mesajlar / Adresler / Hesap bilgileri) + paneller. Özellikler korunur:
 * mesaj listesi, sayfalama, toplu silme; adres ekleme/düzenleme/silme/varsayılan;
 * profil bilgisi; çıkış. Giriş yapılmamışsa giriş kartı gösterilir.
 */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'sonner';
import PageHero from '@/components/common/PageHero';
import { useConfirm } from '@/hooks/use-confirm';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { ArrowRight, CloseIcon } from '@/components/fx/FxIcons';
import { FxAuthCard } from '@/components/fx/FxAuthCard';
import { useFxDialog } from '@/components/fx/useFxDialog';

type T = (key: string, params?: Record<string, string | number>) => string;
type TabKey = 'messages' | 'addresses' | 'profile';
const TABS: TabKey[] = ['messages', 'addresses', 'profile'];

interface ChatEntry { sender: 'admin' | 'user' | string; message: string; createdAt: string }
interface UserMessage {
  _id: string;
  subject?: string;
  message?: string;
  type?: string;
  isGlobal?: boolean;
  createdAt: string;
  adminReply?: string;
  answer?: string;
  conversation?: ChatEntry[];
}
interface Address {
  _id: string;
  title: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  district: string;
  address: string;
  zipCode?: string;
  isPrimary?: boolean;
}
type AddressForm = Omit<Address, '_id' | 'isPrimary'> & { isPrimary: boolean };

const subscribeNoop = () => () => {};
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15M10 16l-4-4 4-4M6 12h10" />
  </svg>
);

/* ------------------------------------------------------------------- Mesajlar */

function MessagesPanel({ t, lang, onUnread }: { t: T; lang: string; onUnread: (n: number) => void }) {
  const { confirm } = useConfirm();
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const dateLocale = 'tr-TR';

  const fetchMessages = useCallback(async (page = 1) => {
    setState('loading');
    try {
      const res = await fetch(`/api/public/user/messages?page=${page}&limit=20`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error('load');
      setMessages(Array.isArray(data.data) ? data.data : []);
      if (data.pagination) setPagination(data.pagination);
      if (data.unreadCount !== undefined) onUnread(data.unreadCount);
      setSelected(new Set());
      setState('ok');
    } catch {
      setState('error');
    }
  }, [onUnread]);

  useEffect(() => {
    const timer = setTimeout(() => { void fetchMessages(1); }, 0);
    return () => clearTimeout(timer);
  }, [fetchMessages]);

  const toggle = (id: string) => setSelected((cur) => {
    const next = new Set(cur);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const bulkDelete = async () => {
    const ok = await confirm({
      title: t('auth.account.messages.confirmTitle'),
      description: t('auth.account.messages.confirmBody', { n: selected.size }),
      confirmText: t('auth.account.confirmYes'),
      cancelText: t('auth.account.confirmNo'),
      variant: 'destructive',
    });
    if (!ok) return;
    setBusy(true);
    try {
      const results = await Promise.all(Array.from(selected).map((id) => fetch(`/api/public/user/messages/${id}`, { method: 'DELETE' })));
      const failed = results.some((r) => !r.ok);
      setMessages((cur) => cur.filter((m) => !selected.has(m._id)));
      setSelected(new Set());
      if (failed) toast.error(t('auth.account.error')); else toast.success(t('auth.account.messages.deleted'));
    } catch {
      toast.error(t('auth.account.error'));
    } finally {
      setBusy(false);
    }
  };

  const fmt = (d: string, opts: Intl.DateTimeFormatOptions) => {
    const date = new Date(d);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(dateLocale, opts);
  };

  return (
    <>
      <div className="fx-panel__head"><h2>{t('auth.account.messages.title')}</h2></div>
      {state === 'loading' && (
        <div className="fx-loadrow" role="status"><span className="fx-spin" aria-hidden="true" />{t('auth.account.messages.loading')}</div>
      )}
      {state === 'error' && (
        <div className="fx-empty" role="alert">
          <b>{t('auth.account.messages.loadError')}</b>
          <span><button type="button" className="fx-textbtn" onClick={() => fetchMessages(pagination.page)}>{t('auth.account.retry')}</button></span>
        </div>
      )}
      {state === 'ok' && messages.length === 0 && (
        <div className="fx-empty">
          <b>{t('auth.account.messages.empty')}</b>
          <span>{t('auth.account.messages.emptyBody')}</span>
        </div>
      )}
      {state === 'ok' && messages.length > 0 && (
        <>
          {selected.size > 0 && (
            <div className="fx-bulkbar" role="region" aria-live="polite" aria-label={t('auth.account.messages.selected', { n: selected.size })}>
              <span className="fx-mono">{t('auth.account.messages.selected', { n: selected.size })}</span>
              <div>
                <button type="button" className="fx-textbtn fx-textbtn--muted" onClick={() => setSelected(new Set())}>{t('auth.account.messages.clear')}</button>
                <button type="button" className="fx-btn fx-btn--danger fx-btn--sm" onClick={bulkDelete} disabled={busy} aria-busy={busy}>
                  {busy ? t('auth.account.messages.deleting') : t('auth.account.messages.deleteSelected')}
                </button>
              </div>
            </div>
          )}
          <ul className="fx-msgs">
            {messages.map((msg) => {
              const ann = msg.isGlobal || msg.type === 'announcement';
              const subject = msg.subject || (msg.isGlobal ? t('auth.account.messages.globalSubject') : t('auth.account.messages.questionSubject'));
              const isSel = selected.has(msg._id);
              return (
                <li key={msg._id} className={`fx-msg ${ann ? 'fx-msg--ann' : ''} ${isSel ? 'is-selected' : ''}`}>
                  <div className="fx-msg__check">
                    <input
                      id={`msg-${msg._id}`}
                      type="checkbox"
                      className="fx-check"
                      checked={isSel}
                      onChange={() => toggle(msg._id)}
                      aria-label={t('auth.account.messages.select', { subject })}
                    />
                  </div>
                  <div className="fx-msg__body">
                    <div className="fx-msg__top">
                      <h3>{subject}</h3>
                      <span className="fx-tag">
                        {ann && <span className="fx-badge">{t('auth.account.messages.announcement')}</span>}{' '}
                        <time dateTime={msg.createdAt}>{fmt(msg.createdAt, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
                      </span>
                    </div>
                    {msg.conversation && msg.conversation.length > 0 ? (
                      <ul className="fx-chat">
                        {msg.conversation.map((chat, idx) => (
                          <li key={idx} className={chat.sender === 'admin' ? '' : 'is-me'}>
                            <span className="fx-chat__meta">
                              <b>{chat.sender === 'admin' ? t('auth.account.messages.admin') : t('auth.account.messages.you')}</b>
                              <time dateTime={chat.createdAt}>{fmt(chat.createdAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>
                            </span>
                            <p>{chat.message}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <>
                        {msg.message && <p className="fx-msg__text">{msg.message}</p>}
                        {(msg.adminReply || msg.answer) && (
                          <div className="fx-reply">
                            <b>{t('auth.account.messages.adminReply')}</b>
                            <p>{msg.adminReply || msg.answer}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {pagination.totalPages > 1 && (
            <nav className="fx-pager" aria-label={t('auth.account.messages.pagination')}>
              <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => fetchMessages(pagination.page - 1)} disabled={pagination.page <= 1}>{t('auth.account.messages.prev')}</button>
              <span className="fx-tag" aria-current="page">{t('auth.account.messages.page', { page: pagination.page, total: pagination.totalPages })}</span>
              <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => fetchMessages(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>{t('auth.account.messages.next')}</button>
            </nav>
          )}
        </>
      )}
    </>
  );
}

/* ------------------------------------------------------------------- Adresler */

function AddressDialog({ t, initial, editing, onClose, onSaved }: { t: T; initial: AddressForm; editing: Address | null; onClose: () => void; onSaved: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<AddressForm>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useFxDialog(true, onClose, panelRef);
  const set = (k: keyof AddressForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: k === 'isPrimary' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const formEl = e.currentTarget as HTMLFormElement;
    if (!formEl.checkValidity()) { formEl.reportValidity(); return; }
    setSaving(true);
    setError(null);
    try {
      const url = editing ? `/api/public/user/addresses/${editing._id}` : '/api/public/user/addresses';
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success(editing ? t('auth.account.addresses.updated') : t('auth.account.addresses.added'));
        onSaved();
      } else {
        setError(data.error || t('auth.account.addresses.failed'));
      }
    } catch {
      setError(t('auth.account.error'));
    } finally {
      setSaving(false);
    }
  };

  const F = (k: keyof AddressForm, label: string, opts: { required?: boolean; autoComplete?: string; type?: string; placeholder?: string; optional?: boolean; autoFocus?: boolean } = {}) => (
    <div className="fx-field">
      <label htmlFor={`ad-${k}`}>{label}{opts.optional && <> <span className="fx-req">{t('auth.account.addresses.fields.optional')}</span></>}</label>
      <input id={`ad-${k}`} type={opts.type || 'text'} value={String(form[k] ?? '')} onChange={set(k)} required={opts.required} aria-required={opts.required || undefined} autoComplete={opts.autoComplete} placeholder={opts.placeholder} maxLength={160} data-autofocus={opts.autoFocus || undefined} />
    </div>
  );

  return createPortal(
    <div className="fx-dialog-scrim">
      <div ref={panelRef} className="fx-dialog fx-dialog--sm public-theme public-dark" role="dialog" aria-modal="true" aria-labelledby="ad-title" tabIndex={-1}>
        <div className="fx-dialog__head">
          <div><h2 className="fx-dialog__title" id="ad-title">{editing ? t('auth.account.addresses.editTitle') : t('auth.account.addresses.newTitle')}</h2></div>
          <button type="button" className="fx-iconbtn" onClick={onClose} aria-label={t('auth.account.addresses.close')}><CloseIcon /></button>
        </div>
        <div className="fx-dialog__body">
          <form className="fx-form" onSubmit={save} noValidate>
            {F('title', t('auth.account.addresses.fields.title'), { required: true, placeholder: t('auth.account.addresses.fields.titlePh'), autoFocus: true })}
            <div className="fx-row2">
              {F('fullName', t('auth.account.addresses.fields.fullName'), { required: true, autoComplete: 'name' })}
              {F('phone', t('auth.account.addresses.fields.phone'), { required: true, autoComplete: 'tel', type: 'tel' })}
            </div>
            {F('country', t('auth.account.addresses.fields.country'), { required: true, autoComplete: 'country-name' })}
            <div className="fx-row2">
              {F('city', t('auth.account.addresses.fields.city'), { required: true, autoComplete: 'address-level1' })}
              {F('district', t('auth.account.addresses.fields.district'), { required: true, autoComplete: 'address-level2' })}
            </div>
            <div className="fx-field">
              <label htmlFor="ad-address">{t('auth.account.addresses.fields.address')}</label>
              <textarea id="ad-address" rows={3} value={form.address} onChange={set('address')} required aria-required="true" autoComplete="street-address" maxLength={500} />
            </div>
            <div className="fx-row2">
              {F('zipCode', t('auth.account.addresses.fields.zip'), { autoComplete: 'postal-code', optional: true })}
              <div className="fx-field fx-field--end">
                <label className="fx-checkrow" htmlFor="ad-isPrimary">
                  <input id="ad-isPrimary" type="checkbox" className="fx-check" checked={form.isPrimary} onChange={set('isPrimary')} />
                  {t('auth.account.addresses.fields.primary')}
                </label>
              </div>
            </div>
            {error && <div className="fx-notice fx-notice--err" role="alert"><span className="fx-small">{error}</span></div>}
            <div className="fx-form-actions">
              <div className="fx-dialog__actions">
                <button type="button" className="fx-btn fx-btn--ghost" onClick={onClose}>{t('auth.account.addresses.cancel')}</button>
                <button type="submit" className="fx-btn fx-btn--primary" disabled={saving} aria-busy={saving}>
                  {saving ? t('auth.account.addresses.saving') : t('auth.account.addresses.save')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function AddressesPanel({ t, userName }: { t: T; userName: string }) {
  const { confirm } = useConfirm();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<{ editing: Address | null; initial: AddressForm } | null>(null);
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch('/api/public/user/addresses');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error('load');
      setAddresses(Array.isArray(data.data) ? data.data : []);
      setState('ok');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void fetchAddresses(); }, 0);
    return () => clearTimeout(timer);
  }, [fetchAddresses]);

  const openDialog = (addr: Address | null = null) => {
    setDialog({
      editing: addr,
      initial: addr
        ? { title: addr.title, fullName: addr.fullName, phone: addr.phone, country: addr.country, city: addr.city, district: addr.district, address: addr.address, zipCode: addr.zipCode || '', isPrimary: !!addr.isPrimary }
        : { title: '', fullName: userName, phone: '', country: t('auth.account.addresses.defaultCountry'), city: '', district: '', address: '', zipCode: '', isPrimary: addresses.length === 0 },
    });
  };

  const remove = async (id: string) => {
    const ok = await confirm({
      title: t('auth.account.addresses.confirmTitle'),
      description: t('auth.account.addresses.confirmBody'),
      confirmText: t('auth.account.confirmYes'),
      cancelText: t('auth.account.confirmNo'),
      variant: 'destructive',
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/public/user/addresses/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setAddresses((cur) => cur.filter((a) => a._id !== id));
        toast.success(t('auth.account.addresses.removed'));
      } else toast.error(data.error || t('auth.account.addresses.failed'));
    } catch {
      toast.error(t('auth.account.error'));
    } finally {
      setBusy(false);
    }
  };

  const makePrimary = async (id: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/public/user/addresses/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPrimary: true }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        await fetchAddresses();
        toast.success(t('auth.account.addresses.primarySet'));
      } else toast.error(data.error || t('auth.account.addresses.failed'));
    } catch {
      toast.error(t('auth.account.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="fx-panel__head">
        <h2>{t('auth.account.addresses.title')}</h2>
        <button type="button" className="fx-btn fx-btn--primary fx-btn--sm" onClick={() => openDialog()} aria-haspopup="dialog">{t('auth.account.addresses.add')}</button>
      </div>
      {state === 'loading' && <div className="fx-loadrow" role="status"><span className="fx-spin" aria-hidden="true" />{t('auth.account.addresses.loading')}</div>}
      {state === 'error' && (
        <div className="fx-empty" role="alert">
          <b>{t('auth.account.addresses.loadError')}</b>
          <span><button type="button" className="fx-textbtn" onClick={() => { setState('loading'); void fetchAddresses(); }}>{t('auth.account.retry')}</button></span>
        </div>
      )}
      {state === 'ok' && addresses.length === 0 && (
        <div className="fx-empty">
          <b>{t('auth.account.addresses.empty')}</b>
          <span>{t('auth.account.addresses.emptyBody')}</span>
        </div>
      )}
      {state === 'ok' && addresses.length > 0 && (
        <ul className="fx-addrs fx-msgs">
          {addresses.map((addr) => (
            <li key={addr._id} className={`fx-addr ${addr.isPrimary ? 'is-primary' : ''}`}>
              <div className="fx-addr__top">
                <div>
                  <h3>{addr.title}</h3>
                  <span className="fx-small fx-muted">{addr.fullName}</span>
                </div>
                {addr.isPrimary && <span className="fx-badge">{t('auth.account.addresses.primary')}</span>}
              </div>
              <address>
                <span>{addr.address}</span>
                <span>{[addr.district, addr.city].filter(Boolean).join(' / ')}{addr.zipCode ? ` · ${addr.zipCode}` : ''}</span>
                <span>{addr.country}</span>
                <span className="fx-mono">{addr.phone}</span>
              </address>
              <div className="fx-addr__acts">
                {!addr.isPrimary && (
                  <button type="button" className="fx-textbtn fx-textbtn--muted" onClick={() => makePrimary(addr._id)} disabled={busy}>{t('auth.account.addresses.makePrimary')}</button>
                )}
                <button type="button" className="fx-textbtn" onClick={() => openDialog(addr)} aria-haspopup="dialog">{t('auth.account.addresses.edit')}<span className="sr-only">: {addr.title}</span></button>
                <button type="button" className="fx-textbtn fx-textbtn--danger" onClick={() => remove(addr._id)} disabled={busy}>{t('auth.account.addresses.remove')}<span className="sr-only">: {addr.title}</span></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {mounted && dialog && (
        <AddressDialog
          t={t}
          initial={dialog.initial}
          editing={dialog.editing}
          onClose={() => setDialog(null)}
          onSaved={() => { setDialog(null); void fetchAddresses(); }}
        />
      )}
    </>
  );
}

/* --------------------------------------------------------------------- Profil */

function ProfilePanel({ t, lang, name, email }: { t: T; lang: string; name: string; email: string }) {
  const [reset, setReset] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const sendReset = async () => {
    setReset('sending');
    try {
      const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      setReset(res.ok ? 'done' : 'error');
    } catch {
      setReset('error');
    }
  };
  return (
    <>
      <div className="fx-panel__head"><h2>{t('auth.account.profile.title')}</h2></div>
      <div className="fx-profile">
        <div className="fx-form">
          <div className="fx-field">
            <label htmlFor="pf-name">{t('auth.account.profile.name')}</label>
            <input id="pf-name" type="text" value={name} readOnly aria-describedby="pf-note" />
          </div>
          <div className="fx-field">
            <label htmlFor="pf-email">{t('auth.email')}</label>
            <input id="pf-email" type="email" value={email} readOnly aria-describedby="pf-note" />
          </div>
          <p className="fx-small fx-muted" id="pf-note">
            {t('auth.account.profile.readonly')} <Link className="fx-link" href={`/${lang}/contact`}>{t('auth.account.profile.contactLink')} <ArrowRight /></Link>
          </p>
        </div>
        <div className="fx-profile__sec">
          <h3>{t('auth.account.profile.password')}</h3>
          <p>{t('auth.account.profile.passwordBody')}</p>
          {reset === 'done' ? (
            <div className="fx-notice" role="status"><span className="fx-small">{t('auth.account.profile.resetSent', { email })}</span></div>
          ) : (
            <div>
              <button type="button" className="fx-btn fx-btn--ghost" onClick={sendReset} disabled={reset === 'sending' || !email} aria-busy={reset === 'sending'}>
                {reset === 'sending' ? t('auth.account.profile.sending') : t('auth.account.profile.sendReset')}
              </button>
            </div>
          )}
          {reset === 'error' && <div className="fx-notice fx-notice--err" role="alert"><span className="fx-small">{t('auth.account.profile.resetError')}</span></div>}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------- Sayfa */

export default function AccountPage() {
  const { data: session, status } = useSession();
  const { t, locale: lang } = useAppTranslations('fx');
  const [activeTab, setActiveTab] = useState<TabKey>('messages');
  const [unreadCount, setUnreadCount] = useState(0);
  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({ messages: null, addresses: null, profile: null });

  useEffect(() => { document.title = `${t('auth.account.eyebrow')} | FIXRAL`; }, [t]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/public/user/messages?page=1&limit=1')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.success && data.unreadCount !== undefined) setUnreadCount(data.unreadCount); })
      .catch(() => {});
  }, [status]);

  const onUnread = useCallback((n: number) => setUnreadCount(n), []);

  const onTabKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const i = TABS.indexOf(activeTab);
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    setActiveTab(TABS[next]);
    tabRefs.current[TABS[next]]?.focus();
  };

  if (status === 'loading') {
    return (
      <>
        <PageHero variant="compact" badge={t('auth.account.eyebrow')} title={t('auth.account.greetingFallback')} />
        <section className="fx-sec fx-sec--tight">
          <div className="fx-wrap">
            <div className="fx-loadrow" role="status"><span className="fx-spin" aria-hidden="true" />{t('auth.account.loading')}</div>
          </div>
        </section>
      </>
    );
  }

  if (status === 'unauthenticated' || !session?.user) {
    const back = encodeURIComponent(`/${lang}/account`);
    return (
      <FxAuthCard
        titleId="acc-signed-out"
        title={t('auth.account.signedOut.title')}
        lede={t('auth.account.signedOut.lede')}
        foot={<>{t('auth.login.noAccount')} <Link className="fx-link" href={`/${lang}/register?redirect=${back}`}>{t('auth.account.signedOut.register')} <ArrowRight /></Link></>}
      >
        <Link className="fx-btn fx-btn--primary fx-btn--block" href={`/${lang}/login?callbackUrl=${back}`}>
          {t('auth.account.signedOut.login')} <ArrowRight />
        </Link>
      </FxAuthCard>
    );
  }

  const name = session.user.name || '';
  const email = session.user.email || '';

  return (
    <>
      <PageHero
        variant="compact"
        badge={t('auth.account.eyebrow')}
        title={name ? t('auth.account.greeting', { name }) : t('auth.account.greetingFallback')}
        description={t('auth.account.lede')}
        aside={
          <div className="fx-acct__hero-aside">
            <div className="fx-acct__stat">
              <b>{unreadCount}</b>
              <span>{t('auth.account.unread')}</span>
            </div>
          </div>
        }
      />
      <section className="fx-sec fx-sec--tight">
        <div className="fx-wrap">
          <div className="fx-tabs-bar">
            <div className="fx-tabs" role="tablist" aria-label={t('auth.account.tabsLabel')}>
              {TABS.map((k) => (
                <button
                  key={k}
                  ref={(el) => { tabRefs.current[k] = el; }}
                  type="button"
                  role="tab"
                  id={`acc-tab-${k}`}
                  aria-selected={activeTab === k}
                  aria-controls={`acc-panel-${k}`}
                  tabIndex={activeTab === k ? 0 : -1}
                  onClick={() => setActiveTab(k)}
                  onKeyDown={onTabKey}
                >
                  {t(`auth.account.tabs.${k}`)}
                  {k === 'messages' && unreadCount > 0 && <span className="fx-count" aria-label={`${unreadCount} ${t('auth.account.unread')}`}>{unreadCount}</span>}
                </button>
              ))}
            </div>
            <button type="button" className="fx-tabs__logout" onClick={() => signOut({ callbackUrl: `/${lang}` })}>
              <LogoutIcon /> {t('auth.account.logout')}
            </button>
          </div>

          <div className="fx-panel" role="tabpanel" id={`acc-panel-${activeTab}`} aria-labelledby={`acc-tab-${activeTab}`} tabIndex={0}>
            {activeTab === 'messages' && <MessagesPanel t={t} lang={lang} onUnread={onUnread} />}
            {activeTab === 'addresses' && <AddressesPanel t={t} userName={name} />}
            {activeTab === 'profile' && <ProfilePanel t={t} lang={lang} name={name} email={email} />}
          </div>
        </div>
      </section>
    </>
  );
}
