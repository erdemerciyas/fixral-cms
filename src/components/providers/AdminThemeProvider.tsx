'use client';

import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useMemo,
    useSyncExternalStore,
    useEffect,
} from 'react';

/**
 * Admin paneli tema sağlayıcısı (next-themes yerine özel implementasyon).
 *
 * Neden next-themes değil: next-themes tema FOUC script'ini React ağacının
 * içinde <script> olarak render eder; React 19 client render'da script tag
 * görünce console error fırlatır (dev overlay "Console Error"). Admin layout
 * tamamen client component olduğu için script her navigasyonda client'ta
 * render oluyordu. Burada script yok — FOUC koruması root layout <head>'indeki
 * blocking ADMIN_THEME_INIT_SCRIPT ile sağlanır.
 *
 * - `storageKey`: public taraftaki eski `theme` anahtarıyla çakışmaması için ayrık.
 * - attribute="class": <html>'e `dark`/`light` sınıfı yazar (globals.css `.dark`).
 */

export const ADMIN_THEME_STORAGE_KEY = 'fixral-admin-theme';

type AdminTheme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface AdminThemeContextValue {
    theme: AdminTheme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: AdminTheme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextValue | undefined>(undefined);

function readStoredTheme(): AdminTheme {
    if (typeof window === 'undefined') return 'system';
    try {
        const stored = localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    } catch {
        // localStorage erişilemezse varsayılana düş
    }
    return 'system';
}

/**
 * Tema tercihi için mini external store: useSyncExternalStore ile okunur.
 * Böylece mount sonrası localStorage okuması için efekt içinde setState
 * gerekmez (SSR/hydrate tutarlılığı server snapshot ile sağlanır).
 */
const themeListeners = new Set<() => void>();
let cachedTheme: AdminTheme | null = null;

function getThemeSnapshot(): AdminTheme {
    if (cachedTheme === null) cachedTheme = readStoredTheme();
    return cachedTheme;
}

function subscribeTheme(listener: () => void) {
    themeListeners.add(listener);
    const onStorage = (event: StorageEvent) => {
        if (event.key !== ADMIN_THEME_STORAGE_KEY) return;
        cachedTheme = null; // önbelleği düşür, tekrar okunsun
        themeListeners.forEach((l) => l());
    };
    window.addEventListener('storage', onStorage);
    return () => {
        themeListeners.delete(listener);
        window.removeEventListener('storage', onStorage);
    };
}

function writeTheme(next: AdminTheme) {
    cachedTheme = next;
    try {
        localStorage.setItem(ADMIN_THEME_STORAGE_KEY, next);
    } catch {
        // localStorage erişilemezse sadece bellek içi tut
    }
    themeListeners.forEach((l) => l());
}

/** Sistem tercihi için store — prefers-color-scheme değişimini dinler. */
function getSystemSnapshot(): ResolvedTheme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function subscribeSystemTheme(listener: () => void) {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
}

function applyThemeClass(resolved: ResolvedTheme) {
    const el = document.documentElement;
    el.classList.remove('light', 'dark');
    el.classList.add(resolved);
    el.style.colorScheme = resolved;
}

/** next-themes'teki `disableTransitionOnChange` dengi: tema değişimi
 * anında renk geçiş animasyonlarını bir frame'liğine bastırır. */
function suppressTransitions() {
    const style = document.createElement('style');
    style.appendChild(
        document.createTextNode(
            '*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}'
        )
    );
    document.head.appendChild(style);
    // Zorla reflow + iki frame sonra temizle
    void document.body.offsetHeight;
    requestAnimationFrame(() => {
        requestAnimationFrame(() => style.remove());
    });
}

export function AdminThemeProvider({ children }: { children: ReactNode }) {
    // İlk render'da localStorage okunmaz (SSR/hydrate tutarlılığı için
    // server snapshot 'system' döner); mount sonrası store devreye girer.
    const theme = useSyncExternalStore<AdminTheme>(subscribeTheme, getThemeSnapshot, () => 'system');
    const systemTheme = useSyncExternalStore<ResolvedTheme>(subscribeSystemTheme, getSystemSnapshot, () => 'light');

    const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

    // Tema her değiştiğinde <html> sınıfını güncelle
    useEffect(() => {
        applyThemeClass(resolvedTheme);
    }, [resolvedTheme]);

    const setTheme = useCallback((next: AdminTheme) => {
        suppressTransitions();
        writeTheme(next);
    }, []);

    const value = useMemo(
        () => ({ theme, resolvedTheme, setTheme }),
        [theme, resolvedTheme, setTheme]
    );

    return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
}

export function useTheme(): AdminThemeContextValue {
    const ctx = useContext(AdminThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used within AdminThemeProvider');
    }
    return ctx;
}
