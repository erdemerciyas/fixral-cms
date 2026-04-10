'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PrefetchLink from '../PrefetchLink';
import Link from 'next/link';
import { MagnifyingGlass, User, PaperPlaneTilt, SignOut, GearSix } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';

interface NavLink {
    href: string;
    label: string;
    icon: any;
    isExternal?: boolean;
}

interface DesktopNavProps {
    navLinks: NavLink[];
    pathname: string;
    isScrolled: boolean;
    isTransparentPage: boolean;
    onOpenProjectModal?: () => void;
    onOpenSearch?: () => void;
    compact?: boolean;
}

export default function DesktopNav({
    navLinks,
    pathname,
    isScrolled,
    isTransparentPage,
    onOpenProjectModal,
    onOpenSearch,
    compact = false,
}: DesktopNavProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const isTransparent = !isScrolled && isTransparentPage;

    const { data: session } = useSession();
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const accountRef = useRef<HTMLDivElement>(null);
    const accountTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const currentLang = ['tr', 'es'].includes(pathname.split('/')[1]) ? pathname.split('/')[1] : 'tr';
    const isAdmin = session?.user && (session.user as any).role === 'admin';

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (accountRef.current && !accountRef.current.contains(e.target as Node)) setIsAccountOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleAccountEnter = () => { clearTimeout(accountTimeoutRef.current); setIsAccountOpen(true); };
    const handleAccountLeave = () => { accountTimeoutRef.current = setTimeout(() => setIsAccountOpen(false), 200); };

    return (
        <div className="flex items-center gap-3">
            <nav role="navigation" aria-label="Ana navigasyon">
                <div className={`flex items-center ${compact ? 'gap-0' : 'gap-0.5'} relative`}>
                    {navLinks.map((link, index) => {
                        const isActive = pathname === link.href;

                        const content = (
                            <>
                                {hoveredIndex === index && !isActive && (
                                    <motion.span
                                        layoutId="desktop-nav-hover"
                                        className="absolute inset-0 rounded-full"
                                        style={{
                                            background: isTransparent ? 'rgba(255,255,255,0.08)' : 'rgba(0,52,80,0.04)',
                                        }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{link.label}</span>
                                {isActive && (
                                    <motion.span
                                        layoutId="desktop-nav-active"
                                        className="absolute bottom-0 left-4 right-4 h-[1.5px] rounded-full"
                                        style={{
                                            background: isTransparent
                                                ? 'rgba(255,255,255,0.8)'
                                                : '#003450',
                                        }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        aria-hidden="true"
                                    />
                                )}
                            </>
                        );

                        const linkClasses = `
                            relative ${compact ? 'px-3 py-1.5 text-[13px]' : 'px-4 py-2 text-sm'}
                            font-medium whitespace-nowrap
                            focus-visible:outline-none focus-visible:ring-2
                            focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2
                            rounded-full
                            ${isActive
                                ? isTransparent ? 'text-white' : 'text-zinc-900'
                                : isTransparent ? 'text-white/70 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                            }
                        `;

                        const transitionStyle = { transition: 'color 300ms cubic-bezier(0.32, 0.72, 0, 1)' };

                        if (link.isExternal) {
                            return (
                                <a
                                    key={index}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={linkClasses}
                                    style={transitionStyle}
                                    aria-current={isActive ? 'page' : undefined}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    {content}
                                </a>
                            );
                        }

                        return (
                            <PrefetchLink
                                key={index}
                                href={link.href}
                                className={linkClasses}
                                style={transitionStyle}
                                aria-current={isActive ? 'page' : undefined}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {content}
                            </PrefetchLink>
                        );
                    })}
                </div>
            </nav>

            <div className={`h-4 w-px mx-1 ${isTransparent ? 'bg-white/10' : 'bg-zinc-200'}`} />

            <div className="flex items-center gap-1">
                <button
                    onClick={onOpenSearch}
                    className="p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500"
                    style={{
                        color: isTransparent ? 'rgba(255,255,255,0.6)' : '#71717a',
                        transition: 'all 300ms cubic-bezier(0.32, 0.72, 0, 1)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = isTransparent ? '#fff' : '#18181b'}
                    onMouseLeave={(e) => e.currentTarget.style.color = isTransparent ? 'rgba(255,255,255,0.6)' : '#71717a'}
                    aria-label="Ara (Ctrl+K)"
                >
                    <MagnifyingGlass size={18} weight="light" />
                </button>

                <div ref={accountRef} className="relative" onMouseEnter={handleAccountEnter} onMouseLeave={handleAccountLeave}>
                    <button
                        onClick={() => setIsAccountOpen(!isAccountOpen)}
                        className="p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500"
                        style={{
                            color: isTransparent ? 'rgba(255,255,255,0.6)' : '#71717a',
                            transition: 'all 300ms cubic-bezier(0.32, 0.72, 0, 1)',
                        }}
                        aria-label="Hesabım"
                        aria-expanded={isAccountOpen}
                    >
                        {session?.user ? (
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-primary-400 to-brand-primary-700 flex items-center justify-center text-white text-[10px] font-bold ring-1 ring-white/20">
                                {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                            </div>
                        ) : (
                            <User size={18} weight="light" />
                        )}
                    </button>
                    <AnimatePresence>
                        {isAccountOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                                className="absolute right-0 top-full mt-2 w-56 bg-white/90 backdrop-blur-2xl rounded-2xl overflow-hidden z-[60]"
                                style={{
                                    border: '1px solid rgba(0, 52, 80, 0.06)',
                                    boxShadow: '0 20px 40px -15px rgba(0, 52, 80, 0.12)',
                                }}
                            >
                                {session?.user ? (
                                    <>
                                        <div className="px-4 py-3 border-b border-zinc-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary-400 to-brand-primary-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                    {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-zinc-900 truncate">{session.user.name || 'Kullanıcı'}</p>
                                                    <p className="text-[11px] text-zinc-400 truncate">{session.user.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {isAdmin && (
                                            <div className="py-1 border-b border-zinc-100">
                                                <Link
                                                    href="/admin/dashboard"
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                                    style={{ transition: 'background 200ms cubic-bezier(0.32, 0.72, 0, 1)' }}
                                                    onClick={() => setIsAccountOpen(false)}
                                                >
                                                    <GearSix size={16} weight="light" />
                                                    <span>Admin Paneli</span>
                                                </Link>
                                            </div>
                                        )}

                                        <div className="py-1">
                                            <Link
                                                href={`/${currentLang}/account`}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50"
                                                style={{ transition: 'background 200ms cubic-bezier(0.32, 0.72, 0, 1)' }}
                                                onClick={() => setIsAccountOpen(false)}
                                            >
                                                <User size={16} weight="light" />
                                                <span>Hesabım</span>
                                            </Link>
                                        </div>

                                        <div className="border-t border-zinc-100 py-1">
                                            <Link
                                                href="/api/auth/signout"
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                                                style={{ transition: 'background 200ms cubic-bezier(0.32, 0.72, 0, 1)' }}
                                                onClick={() => setIsAccountOpen(false)}
                                            >
                                                <SignOut size={16} weight="light" />
                                                <span>Çıkış Yap</span>
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-3 space-y-2">
                                        <Link
                                            href={`/${currentLang}/login`}
                                            className="flex items-center justify-center w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white"
                                            style={{
                                                background: '#003450',
                                                transition: 'all 300ms cubic-bezier(0.32, 0.72, 0, 1)',
                                            }}
                                            onClick={() => setIsAccountOpen(false)}
                                        >
                                            Giriş Yap
                                        </Link>
                                        <Link
                                            href={`/${currentLang}/register`}
                                            className="flex items-center justify-center w-full px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50"
                                            style={{
                                                border: '1px solid rgba(0,52,80,0.1)',
                                                transition: 'all 300ms cubic-bezier(0.32, 0.72, 0, 1)',
                                            }}
                                            onClick={() => setIsAccountOpen(false)}
                                        >
                                            Kayıt Ol
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {onOpenProjectModal && (
                <button
                    onClick={onOpenProjectModal}
                    className="group relative flex items-center gap-2 rounded-full font-medium whitespace-nowrap flex-shrink-0 ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-600 active:scale-[0.97]"
                    style={{
                        height: compact ? '32px' : '36px',
                        padding: compact ? '0 14px' : '0 20px',
                        fontSize: compact ? '12px' : '13px',
                        background: isTransparent ? 'rgba(255,255,255,0.12)' : '#003450',
                        color: isTransparent ? '#ffffff' : '#ffffff',
                        backdropFilter: isTransparent ? 'blur(10px)' : 'none',
                        border: isTransparent ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                        transition: 'all 500ms cubic-bezier(0.32, 0.72, 0, 1)',
                        boxShadow: isTransparent ? 'none' : '0 4px 12px rgba(0, 52, 80, 0.15)',
                    }}
                    aria-label="Proje başvurusu formunu aç"
                >
                    <PaperPlaneTilt
                        size={14}
                        weight="light"
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                    />
                    <span>Proje Başvurusu</span>
                </button>
            )}
        </div>
    );
}
