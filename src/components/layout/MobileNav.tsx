'use client';

import { Fragment, useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { X, PaperPlaneTilt, User, MagnifyingGlass } from '@phosphor-icons/react';
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
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50 lg:hidden">
                <Transition.Child
                    as={Fragment}
                    enter="duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className="fixed inset-0"
                        aria-hidden="true"
                        style={{
                            background: 'rgba(9, 20, 29, 0.92)',
                            backdropFilter: 'blur(32px)',
                            WebkitBackdropFilter: 'blur(32px)',
                        }}
                    />
                </Transition.Child>

                <Transition.Child
                    as={Fragment}
                    enter="duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Dialog.Panel className="fixed inset-0 flex flex-col h-[100dvh]">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
                            <Dialog.Title className="text-lg font-semibold text-white/90 tracking-tight">
                                {logoText || 'Menu'}
                            </Dialog.Title>
                            <button
                                onClick={onClose}
                                className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5"
                                style={{ transition: 'all 300ms cubic-bezier(0.32, 0.72, 0, 1)' }}
                                aria-label="Menuyu kapat"
                            >
                                <X size={22} weight="light" />
                            </button>
                        </div>

                        <div className="mx-6 h-px bg-white/[0.06] flex-shrink-0" />

                        {/* Search */}
                        <div className="px-6 pt-5 pb-2 flex-shrink-0">
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <MagnifyingGlass
                                    size={16}
                                    weight="light"
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                                />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Ara..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        border: '1px solid rgba(255, 255, 255, 0.06)',
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
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate={isOpen ? 'visible' : 'exit'}
                                className="space-y-1"
                            >
                                {navLinks.map((link, index) => (
                                    <motion.div key={index} variants={itemVariants}>
                                        <MobileNavLink
                                            href={link.href}
                                            label={link.label}
                                            icon={link.icon}
                                            isActive={pathname === link.href}
                                            isExternal={link.isExternal}
                                            index={index}
                                            onClick={onClose}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </nav>

                        {/* Bottom Actions */}
                        {navLoaded && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                                className="flex-shrink-0 px-6 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] pt-2 space-y-3"
                            >
                                <div className="h-px bg-white/[0.06] mb-4" />

                                {session?.user && (
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-2"
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary-300 to-brand-primary-600 flex items-center justify-center text-white text-sm font-bold ring-1 ring-white/10">
                                            {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{session.user.name || 'Kullanici'}</p>
                                            <p className="text-xs text-white/30 truncate">{session.user.email}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    {session?.user ? (
                                        <Link
                                            href={`/${currentLang}/account`}
                                            onClick={onClose}
                                            className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white"
                                            style={{
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                transition: 'all 300ms cubic-bezier(0.32, 0.72, 0, 1)',
                                            }}
                                            aria-label="Hesabim"
                                        >
                                            <User size={18} weight="light" />
                                            <span>Hesabim</span>
                                        </Link>
                                    ) : (
                                        <Link
                                            href={`/${currentLang}/login`}
                                            onClick={onClose}
                                            className="flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white"
                                            style={{
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                transition: 'all 300ms cubic-bezier(0.32, 0.72, 0, 1)',
                                            }}
                                        >
                                            <User size={18} weight="light" />
                                            <span>Giris Yap</span>
                                        </Link>
                                    )}
                                </div>

                                <button
                                    onClick={handleProjectModalClick}
                                    className="group relative w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-medium text-sm active:scale-[0.98] overflow-hidden"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        color: '#003450',
                                        transition: 'all 300ms cubic-bezier(0.32, 0.72, 0, 1)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                    }}
                                    aria-label="Proje basvurusu formunu ac"
                                >
                                    <PaperPlaneTilt
                                        size={16}
                                        weight="light"
                                        className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                        aria-hidden="true"
                                    />
                                    <span className="relative z-10">Proje Basvurusu</span>
                                </button>
                            </motion.div>
                        )}
                    </Dialog.Panel>
                </Transition.Child>
            </Dialog>
        </Transition>
    );
}
