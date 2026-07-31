'use client';

import { useState, useRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { m } from 'framer-motion';
import { X, Send as PaperPlaneTilt, User, Search as MagnifyingGlass } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import MobileNavLink from './MobileNavLink';

interface NavLink {
    href: string;
    label: string;
    icon: any;
    isExternal?: boolean;
}

interface MobileNavProps {
    isOpen: boolean;
    navLinks: NavLink[];
    pathname: string;
    onClose: () => void;
    onOpenProjectModal: () => void;
    navLoaded: boolean;
    isScrolled?: boolean;
    isTransparentPage?: boolean;
    logoText?: string;
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.06, delayChildren: 0.15 },
    },
    exit: {
        transition: { staggerChildren: 0.03, staggerDirection: -1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
    },
    exit: {
        opacity: 0,
        y: -10,
        filter: 'blur(4px)',
        transition: { duration: 0.2 },
    },
};

export default function MobileNav({
    isOpen,
    navLinks,
    pathname,
    onClose,
    onOpenProjectModal,
    navLoaded,
    logoText,
}: MobileNavProps) {
    const { data: session } = useSession();
    const currentLang = ['tr', 'es'].includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'tr';

    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleProjectModalClick = () => {
        onClose();
        onOpenProjectModal();
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const newsRoute = currentLang === 'es' ? 'noticias' : 'haberler';
            window.location.href = `/${currentLang}/${newsRoute}?q=${encodeURIComponent(searchQuery.trim())}`;
            onClose();
            setSearchQuery('');
        }
    };

    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogPrimitive.Portal>
                {/* Printables mobil paradigma: token tabanlı zemin + foreground metin */}
                <DialogPrimitive.Overlay
                    className="fixed inset-0 z-50 lg:hidden bg-background/95 backdrop-blur-[32px] duration-500 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
                    style={{
                        WebkitBackdropFilter: 'blur(32px)',
                    }}
                />

                <DialogPrimitive.Content
                    aria-describedby={undefined}
                    className="fixed inset-0 z-50 flex flex-col h-dvh lg:hidden focus:outline-hidden duration-500 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
                >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
                            <DialogPrimitive.Title className="text-lg font-semibold text-foreground tracking-tight">
                                {logoText || 'Menü'}
                            </DialogPrimitive.Title>
                            <button
                                onClick={onClose}
                                className="p-2.5 rounded-xs text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                                style={{ transition: 'all 300ms cubic-bezier(0.32, 0.72, 0, 1)' }}
                                aria-label="Menüyü kapat"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="mx-6 h-px bg-border shrink-0" />

                        {/* Search — precision: turuncu dolgu, 2px kontrol radius'u, token metin/ikon */}
                        <div className="px-6 pt-5 pb-2 shrink-0">
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <MagnifyingGlass
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground"
                                />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Ara..."
                                    className="w-full pl-11 pr-4 py-3 rounded-xs text-sm bg-primary text-primary-foreground placeholder:text-primary-foreground/80 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background border border-transparent"
                                    style={{
                                        transition: 'all 300ms cubic-bezier(0.32, 0.72, 0, 1)',
                                    }}
                                />
                            </form>
                        </div>

                        {/* Navigation -- staggered reveal */}
                        <nav
                            aria-label="Mobil navigasyon"
                            className="flex-1 overflow-y-auto px-4 py-6 min-h-0"
                        >
                            <m.div
                                variants={containerVariants}
                                initial="hidden"
                                animate={isOpen ? 'visible' : 'exit'}
                                className="space-y-1"
                            >
                                {navLinks.map((link, index) => (
                                    <m.div key={index} variants={itemVariants}>
                                        <MobileNavLink
                                            href={link.href}
                                            label={link.label}
                                            icon={link.icon}
                                            isActive={pathname === link.href}
                                            isExternal={link.isExternal}
                                            index={index}
                                            onClick={onClose}
                                        />
                                    </m.div>
                                ))}
                            </m.div>
                        </nav>

                        {/* Bottom Actions */}
                        {navLoaded && (
                            <m.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                                className="shrink-0 px-6 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] pt-2 space-y-3"
                            >
                                <div className="h-px bg-border mb-4" />

                                {session?.user && (
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-sm mb-2 bg-muted border border-border">
                                        <div className="w-9 h-9 rounded-xs bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold ring-1 ring-border">
                                            {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{session.user.name || 'Kullanıcı'}</p>
                                            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    {session?.user ? (
                                        <Link
                                            href={`/${currentLang}/account`}
                                            onClick={onClose}
                                            className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xs text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary border border-border focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                                            style={{
                                                transition: 'all 300ms cubic-bezier(0.32, 0.72, 0, 1)',
                                            }}
                                            aria-label="Hesabım"
                                        >
                                            <User size={18} />
                                            <span>Hesabım</span>
                                        </Link>
                                    ) : (
                                        <Link
                                            href={`/${currentLang}/login`}
                                            onClick={onClose}
                                            className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xs text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary border border-border focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                                            style={{
                                                transition: 'all 300ms cubic-bezier(0.32, 0.72, 0, 1)',
                                            }}
                                        >
                                            <User size={18} />
                                            <span>Giriş Yap</span>
                                        </Link>
                                    )}
                                </div>

                                <button
                                    onClick={handleProjectModalClick}
                                    className="group relative w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xs font-semibold text-sm active:scale-[0.98] overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                    style={{
                                        transition: 'all 300ms cubic-bezier(0.32, 0.72, 0, 1)',
                                    }}
                                    aria-label="Proje başvurusu formunu aç"
                                >
                                    <PaperPlaneTilt
                                        size={16}
                                        className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                        aria-hidden="true"
                                    />
                                    <span className="relative z-10">Proje Başvurusu</span>
                                </button>
                            </m.div>
                        )}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
