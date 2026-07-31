'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { Search as MagnifyingGlassIcon, X as XMarkIcon, Newspaper as NewspaperIcon, FolderOpen as FolderOpenIcon, Wrench as WrenchScrewdriverIcon, ArrowRight as ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import { locales } from '@/i18n';

interface SearchResult {
    title: string;
    description?: string;
    href: string;
    category: string;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    'Haberler': NewspaperIcon,
    'Portföy': FolderOpenIcon,
    'Hizmetler': WrenchScrewdriverIcon,
};

const CATEGORY_COLORS: Record<string, string> = {
    'Haberler': 'bg-primary/10 text-primary',
    'Portföy': 'bg-accent text-accent-foreground',
    'Hizmetler': 'bg-muted text-muted-foreground',
};

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const pathname = usePathname() ?? '/';
    const firstSegment = pathname.split('/')[1];
    const currentLang = (locales as readonly string[]).includes(firstSegment) ? firstSegment : 'tr';

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery('');
            setResults([]);
            setHasSearched(false);
        }
    }, [isOpen]);

    const doSearch = useCallback(async (q: string) => {
        if (!q.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setIsLoading(true);
        setHasSearched(true);

        try {
            const searchResults: SearchResult[] = [];

            const [newsRes, portfolioRes] = await Promise.allSettled([
                fetch(`/api/public/news?search=${encodeURIComponent(q)}&limit=3`),
                fetch(`/api/public/portfolio?search=${encodeURIComponent(q)}&limit=3`),
            ]);

            if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
                const data = await newsRes.value.json();
                const items = Array.isArray(data) ? data : data.news || data.items || [];
                items.slice(0, 3).forEach((item: any) => {
                    const newsRoute = currentLang === 'es' ? 'noticias' : 'haberler';
                    searchResults.push({
                        title: item.title || item.name,
                        description: item.summary || item.excerpt || '',
                        href: `/${currentLang}/${newsRoute}/${item.slug}`,
                        category: 'Haberler',
                    });
                });
            }

            if (portfolioRes.status === 'fulfilled' && portfolioRes.value.ok) {
                const data = await portfolioRes.value.json();
                const items = Array.isArray(data) ? data : data.portfolios || data.items || [];
                items.slice(0, 3).forEach((item: any) => {
                    searchResults.push({
                        title: item.title || item.name,
                        description: item.description || item.summary || '',
                        href: `/${currentLang}/portfolio/${item.slug}`,
                        category: 'Portföy',
                    });
                });
            }

            setResults(searchResults);
        } catch {
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentLang]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(val), 350);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            const newsRoute = currentLang === 'es' ? 'noticias' : 'haberler';
            window.location.href = `/${currentLang}/${newsRoute}?q=${encodeURIComponent(query.trim())}`;
            onClose();
        }
    };

    const groupedResults = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
        if (!acc[r.category]) acc[r.category] = [];
        acc[r.category].push(r);
        return acc;
    }, {});

    return (
        <AnimatePresence>
            {isOpen && (
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal */}
                    <m.div
                        initial={{ opacity: 0, y: -20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="relative w-full max-w-2xl mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
                            {/* Search Input */}
                            <form onSubmit={handleSubmit} className="relative">
                                <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={handleInputChange}
                                    placeholder="Site genelinde ara..."
                                    className="w-full pl-14 pr-20 py-5 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none bg-transparent"
                                    autoComplete="off"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-muted-foreground bg-muted rounded border border-border">
                                        ESC
                                    </kbd>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                        aria-label="Aramayı kapat"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>

                            {/* Results */}
                            {(hasSearched || query.length > 0) && (
                                <div className="border-t border-border">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        </div>
                                    ) : results.length > 0 ? (
                                        <div className="max-h-[50vh] overflow-y-auto py-2">
                                            {Object.entries(groupedResults).map(([category, items]) => {
                                                const Icon = CATEGORY_ICONS[category] || FolderOpenIcon;
                                                const colorClass = CATEGORY_COLORS[category] || 'bg-muted text-muted-foreground';
                                                return (
                                                    <div key={category} className="px-2 mb-1 last:mb-0">
                                                        <div className="flex items-center gap-2 px-3 py-2">
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${colorClass}`}>
                                                                <Icon className="w-3 h-3" />
                                                                {category}
                                                            </span>
                                                            <div className="flex-1 h-px bg-border" />
                                                        </div>
                                                        {items.map((item, i) => (
                                                            <Link
                                                                key={i}
                                                                href={item.href}
                                                                onClick={onClose}
                                                                className="flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl hover:bg-accent transition-colors group"
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                                                        {item.title}
                                                                    </p>
                                                                    {item.description && (
                                                                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                                            {item.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <ArrowRightIcon className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors flex-shrink-0" />
                                                            </Link>
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : hasSearched && query.trim() ? (
                                        <div className="py-12 text-center">
                                            <MagnifyingGlassIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                                            <p className="text-sm text-muted-foreground">
                                                &quot;<span className="font-medium text-foreground">{query}</span>&quot; ile ilgili sonuç bulunamadı.
                                            </p>
                                            <p className="text-xs text-muted-foreground/70 mt-1">
                                                Farklı anahtar kelimeler deneyin
                                            </p>
                                        </div>
                                    ) : null}

                                    {/* Footer hint */}
                                    {results.length > 0 && (
                                        <div className="px-5 py-3 border-t border-border bg-muted/50">
                                            <button
                                                type="button"
                                                onClick={handleSubmit as any}
                                                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <MagnifyingGlassIcon className="w-3.5 h-3.5" />
                                                <span>Tüm sonuçları gör: &quot;{query}&quot;</span>
                                                <ArrowRightIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Quick links when empty */}
                            {!query && (
                                <div className="border-t border-border px-5 py-4">
                                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2.5">Hızlı Erişim</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { label: 'Haberler', href: `/${currentLang}/${currentLang === 'es' ? 'noticias' : 'haberler'}` },
                                            { label: 'Portföy', href: `/${currentLang}/portfolio` },
                                            { label: 'Hizmetler', href: `/${currentLang}/services` },
                                        ].map((link) => (
                                            <Link
                                                key={link.label}
                                                href={link.href}
                                                onClick={onClose}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted rounded-full hover:bg-accent hover:text-foreground transition-colors"
                                            >
                                                {link.label}
                                                <ArrowRightIcon className="w-3 h-3" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </m.div>
                </m.div>
            )}
        </AnimatePresence>
    );
}
