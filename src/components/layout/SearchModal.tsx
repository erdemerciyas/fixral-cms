'use client';

/**
 * Site içi arama (redesign 2026) — prototip `.search` modalı.
 * Statik kaynaklar: paneldeki hizmetler + yazılımlar (useFx; panelde yoksa katalog).
 * API kaynakları: haberler (/api/public/news) ve projeler (/api/public/portfolio);
 * modal ilk açıldığında bir kez çekilir, sonra istemcide süzülür.
 * Klavye: ↑/↓ seçim, Enter aç, Esc kapat; odak kapanı ve odağın geri verilmesi.
 * Kök layout'ta (intl provider dışında) çalıştığı için `useAppTranslations` kullanır.
 */
import { useState, useEffect, useRef, useMemo, useCallback, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { serviceHref, softwareHref, newsBase, toFxLocale } from '@/content/fixral';
import { useFx } from '@/components/fx/FxData';
import { SearchIcon, CloseIcon, ArrowRight } from '@/components/fx/FxIcons';
import { pickTranslation, stripHtml } from '@/components/fx/FxCards';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Group = 'service' | 'software' | 'project' | 'news';

interface Hit {
    group: Group;
    title: string;
    description: string;
    href: string;
    /** Eşleştirme metni (normalize edilmiş) */
    hay: string;
}

const GROUP_ORDER: Group[] = ['service', 'software', 'project', 'news'];
const MAX_PER_REMOTE_GROUP = 5;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Büyük/küçük harf, Türkçe ı/İ ve aksan farklarını yok sayan normalizasyon */
const norm = (s: string) =>
    s
        .toLocaleLowerCase('tr-TR')
        .replace(/ı/g, 'i')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');

type RemoteNews = { slug?: string; title?: string; excerpt?: string; translations?: Record<string, { title?: string; excerpt?: string } | undefined> };
type RemotePortfolio = { slug?: string; title?: string; description?: string; summary?: string; translations?: unknown };

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const { t, locale } = useAppTranslations('fx');
    const L = toFxLocale(locale);
    const fx = useFx(locale);
    const router = useRouter();
    const reduced = useReducedMotion();
    const uid = useId();
    const listId = `${uid}-list`;

    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const [remote, setRemote] = useState<{ news: RemoteNews[]; projects: RemotePortfolio[] } | null>(null);
    const [loadingRemote, setLoadingRemote] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const restoreRef = useRef<HTMLElement | null>(null);
    const fetchedRef = useRef(false);

    /* ---- Açılış / kapanış: odak, kaydırma kilidi, sıfırlama ---- */
    useEffect(() => {
        if (!isOpen) return;
        restoreRef.current = (document.activeElement as HTMLElement) || null;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const focusTimer = setTimeout(() => inputRef.current?.focus(), 30);
        return () => {
            clearTimeout(focusTimer);
            document.body.style.overflow = prevOverflow;
            const el = restoreRef.current;
            // Kapanışta sıfırlama + odağı açan öğeye geri verme
            setTimeout(() => {
                setQuery('');
                setActive(0);
                if (el && document.contains(el)) el.focus();
            }, 0);
        };
    }, [isOpen]);

    /* ---- Haber + proje verisi: ilk açılışta bir kez (bileşen Header ile hep bağlı kalır) ---- */
    useEffect(() => {
        if (!isOpen || fetchedRef.current) return;
        fetchedRef.current = true;
        const timer = setTimeout(() => setLoadingRemote(true), 0);
        const getJson = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);
        Promise.all([
            getJson('/api/public/news?status=published&limit=50'),
            getJson('/api/public/portfolio?limit=60'),
        ]).then(([n, p]) => {
            clearTimeout(timer);
            const newsItems = n?.data?.items || n?.items || n?.news || (Array.isArray(n) ? n : []);
            const projItems = Array.isArray(p) ? p : p?.portfolios || p?.items || p?.data || [];
            setRemote({ news: Array.isArray(newsItems) ? newsItems : [], projects: Array.isArray(projItems) ? projItems : [] });
            setLoadingRemote(false);
        });
    }, [isOpen]);

    /* ---- Kaynak listesi ---- */
    const staticHits = useMemo<Hit[]>(() => {
        const svc = fx.services.map((s): Hit => {
            const x = s.text[L];
            return { group: 'service', title: x.name, description: x.short, href: serviceHref(L, s), hay: norm(`${x.name} ${x.short} ${s.files.join(' ')} ${s.text.tr.name}`) };
        });
        const sw = fx.software.map((s): Hit => {
            const x = s.text[L];
            return { group: 'software', title: s.name, description: x.tagline, href: softwareHref(L, s), hay: norm(`${s.name} ${x.tagline} ${x.kicker} ${x.chips.join(' ')}`) };
        });
        return [...svc, ...sw];
    }, [L, fx.services, fx.software]);

    const remoteHits = useMemo<Hit[]>(() => {
        if (!remote) return [];
        const news = remote.news
            .filter((n) => n?.slug)
            .map((n): Hit => {
                const x = n.translations?.[L] || n.translations?.tr || {};
                const title = x.title || n.title || '';
                const description = stripHtml(x.excerpt || n.excerpt || '').slice(0, 140);
                return { group: 'news', title, description, href: `${newsBase(L)}/${n.slug}`, hay: norm(`${title} ${description}`) };
            })
            .filter((h) => h.title);
        const projects = remote.projects
            .filter((p) => p?.slug)
            .map((p): Hit => {
                const x = pickTranslation(p as RemotePortfolio & Record<string, unknown>, L) as RemotePortfolio;
                const title = x.title || '';
                const description = stripHtml(x.description || x.summary || '').slice(0, 140);
                return { group: 'project', title, description, href: `/${L}/portfolio/${p.slug}`, hay: norm(`${title} ${description}`) };
            })
            .filter((h) => h.title);
        return [...projects, ...news];
    }, [remote, L]);

    const q = norm(query.trim());
    const hits = useMemo<Hit[]>(() => {
        if (!q) return staticHits;
        const terms = q.split(/\s+/).filter(Boolean);
        const match = (h: Hit) => terms.every((term) => h.hay.includes(term));
        const fromStatic = staticHits.filter(match);
        const counts: Record<string, number> = {};
        const fromRemote = remoteHits.filter((h) => {
            if (!match(h)) return false;
            counts[h.group] = (counts[h.group] || 0) + 1;
            return counts[h.group] <= MAX_PER_REMOTE_GROUP;
        });
        return [...fromStatic, ...fromRemote].sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group));
    }, [q, staticHits, remoteHits]);

    const activeIndex = hits.length ? Math.min(active, hits.length - 1) : -1;

    /* ---- Seçili sonucu görünür tut ---- */
    useEffect(() => {
        if (activeIndex < 0) return;
        listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    const go = useCallback((href: string) => {
        onClose();
        router.push(href);
    }, [onClose, router]);

    const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (hits.length) setActive((activeIndex + 1) % hits.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (hits.length) setActive((activeIndex - 1 + hits.length) % hits.length);
        } else if (e.key === 'Home' && hits.length && e.ctrlKey) {
            e.preventDefault();
            setActive(0);
        } else if (e.key === 'End' && hits.length && e.ctrlKey) {
            e.preventDefault();
            setActive(hits.length - 1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && hits[activeIndex]) go(hits[activeIndex].href);
            else if (query.trim()) go(`${newsBase(L)}?search=${encodeURIComponent(query.trim())}`);
        }
    };

    /* ---- Esc + odak kapanı ---- */
    const onDialogKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            onClose();
            return;
        }
        if (e.key !== 'Tab' || !boxRef.current) return;
        const items = Array.from(boxRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    const groupLabel = (g: Group) => t(`search.${g}`).toLocaleUpperCase('tr-TR');
    const showSpinner = !!q && loadingRemote;
    const optionId = (i: number) => `${uid}-opt-${i}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <m.div
                    key="fx-search"
                    className="fx-search public-theme public-dark"
                    role="dialog"
                    aria-modal="true"
                    aria-label={t('search.dialogLabel')}
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
                    transition={{ duration: 0.16 }}
                    onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
                    onKeyDown={onDialogKey}
                >
                    <div className="fx-search__box" ref={boxRef}>
                        <div className="fx-search__bar">
                            <SearchIcon />
                            <input
                                ref={inputRef}
                                type="search"
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                                onKeyDown={onInputKey}
                                placeholder={t('search.placeholder')}
                                aria-label={t('search.inputLabel')}
                                autoComplete="off"
                                spellCheck={false}
                                enterKeyHint="go"
                                role="combobox"
                                aria-expanded={hits.length > 0}
                                aria-controls={listId}
                                aria-autocomplete="list"
                                aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
                            />
                            <kbd className="fx-search__kbd">Esc</kbd>
                            <button type="button" className="fx-search__close" onClick={onClose} aria-label={t('search.close')}>
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="fx-search__res">
                            {!q && <p className="fx-search__head fx-tag">{t('search.shortcuts')}</p>}
                            {hits.length > 0 ? (
                                <ul id={listId} ref={listRef} role="listbox" aria-label={t('search.resultsLabel')} className="fx-search__list">
                                    {hits.map((h, i) => (
                                        <li key={`${h.group}-${h.href}`} role="presentation" className={i > 0 && hits[i - 1].group !== h.group ? 'fx-search__sep' : undefined}>
                                            <Link
                                                id={optionId(i)}
                                                data-idx={i}
                                                role="option"
                                                aria-selected={i === activeIndex}
                                                tabIndex={-1}
                                                className="fx-search__hit"
                                                href={h.href}
                                                onClick={onClose}
                                                onMouseMove={() => { if (i !== activeIndex) setActive(i); }}
                                            >
                                                <span className="fx-tag">{groupLabel(h.group)}</span>
                                                <b>{h.title}</b>
                                                {h.description && <span className="fx-small fx-muted">{h.description}</span>}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                !showSpinner && q && (
                                    <p className="fx-search__empty fx-small fx-muted">{t('search.noResults', { q: query.trim() })}</p>
                                )
                            )}
                            {showSpinner && <p className="fx-search__loading fx-tag" aria-hidden="true">{t('search.loading')}…</p>}
                        </div>

                        <div className="fx-search__foot">
                            <span className="fx-search__keys fx-tag" aria-hidden="true">
                                <kbd>↑</kbd><kbd>↓</kbd> {t('search.hintNav')} · <kbd>Enter</kbd> {t('search.hintOpen')} · <kbd>Esc</kbd> {t('search.hintClose')}
                            </span>
                            {q && (
                                <Link className="fx-link fx-small" href={`${newsBase(L)}?search=${encodeURIComponent(query.trim())}`} onClick={onClose}>
                                    {t('search.allNews', { q: query.trim() })} <ArrowRight />
                                </Link>
                            )}
                        </div>
                        <p className="sr-only" role="status" aria-live="polite">
                            {q ? (showSpinner ? t('search.loading') : t('search.count', { count: hits.length })) : ''}
                        </p>
                    </div>
                </m.div>
            )}
        </AnimatePresence>
    );
}
