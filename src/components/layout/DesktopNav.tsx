'use client';

import { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import PrefetchLink from '../PrefetchLink';
import Link from 'next/link';
import { User, LogOut as SignOut, Settings as GearSix } from 'lucide-react';
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
}

/**
 * DesktopNav — Printables mantığı: token tabanlı zemin üzerinde sade metin linkler.
 * Metin rengi text-foreground, hover'da turuncu (hover:text-primary),
 * aktif linkte turuncu bottom-border + font-semibold.
 */
export default function DesktopNav({ navLinks, pathname }: DesktopNavProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const { data: session } = useSession();
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const accountRef = useRef<HTMLDivElement>(null);
    const accountTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
        <div className="flex items-center gap-2">
            <nav role="navigation" aria-label="Ana navigasyon">
                <div className="flex items-center gap-0.5 relative">
                    {navLinks.map((link, index) => {
                        const isActive = pathname === link.href;

                        const content = (
                            <>
                                {hoveredIndex === index && !isActive && (
                                    <m.span
                                        layoutId="desktop-nav-hover"
                                        className="absolute inset-0 rounded-xl bg-accent"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{link.label}</span>
                                {isActive && (
                                    <m.span
                                        layoutId="desktop-nav-active"
                                        className="absolute bottom-0 left-3.5 right-3.5 h-[2px] rounded-full bg-primary"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        aria-hidden="true"
                                    />
                                )}
                            </>
                        );

                        const linkClasses = `
                            relative px-3.5 py-1.5 text-sm
                            tracking-wide whitespace-nowrap
                            focus-visible:outline-none focus-visible:ring-2
                            focus-visible:ring-ring focus-visible:ring-offset-0
                            rounded-xl transition-colors duration-150
                            ${isActive
                                ? 'text-primary font-semibold'
                                : 'text-muted-foreground font-medium hover:text-primary'
                            }
                        `;

                        if (link.isExternal) {
                            return (
                                <a
                                    key={index}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={linkClasses}
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

            <div className="h-4 w-px mx-1 bg-border" aria-hidden="true" />

            {/* Account dropdown */}
            <div className="flex items-center gap-1">
                <div ref={accountRef} className="relative" onMouseEnter={handleAccountEnter} onMouseLeave={handleAccountLeave}>
                    <button
                        onClick={() => setIsAccountOpen(!isAccountOpen)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                        aria-label="Hesabım"
                        aria-expanded={isAccountOpen}
                    >
                        {session?.user ? (
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-[10px] font-bold ring-1 ring-border">
                                {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                            </div>
                        ) : (
                            <User size={18} />
                        )}
                    </button>
                    <AnimatePresence>
                        {isAccountOpen && (
                            <m.div
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                                className="absolute right-0 top-full mt-2 w-56 bg-popover rounded-xl overflow-hidden z-[60] border border-border"
                                style={{
                                    boxShadow: '0 2px 20px rgba(0,0,0,0.15)',
                                }}
                            >
                                {session?.user ? (
                                    <>
                                        <div className="px-4 py-3 border-b border-border">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                                                    {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-popover-foreground truncate">{session.user.name || 'Kullanıcı'}</p>
                                                    <p className="text-[11px] text-muted-foreground truncate">{session.user.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {isAdmin && (
                                            <div className="py-1 border-b border-border">
                                                <Link
                                                    href="/admin/dashboard"
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-popover-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
                                                    onClick={() => setIsAccountOpen(false)}
                                                >
                                                    <GearSix size={16} />
                                                    <span>Admin Paneli</span>
                                                </Link>
                                            </div>
                                        )}

                                        <div className="py-1">
                                            <Link
                                                href={`/${currentLang}/account`}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-popover-foreground/70 hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
                                                onClick={() => setIsAccountOpen(false)}
                                            >
                                                <User size={16} />
                                                <span>Hesabım</span>
                                            </Link>
                                        </div>

                                        <div className="border-t border-border py-1">
                                            <Link
                                                href="/api/auth/signout"
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors duration-150"
                                                onClick={() => setIsAccountOpen(false)}
                                            >
                                                <SignOut size={16} />
                                                <span>Çıkış Yap</span>
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-3 space-y-2">
                                        <Link
                                            href={`/${currentLang}/login`}
                                            className="flex items-center justify-center w-full px-3 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-[hsl(var(--primary)/0.85)] transition-colors duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            onClick={() => setIsAccountOpen(false)}
                                        >
                                            Giriş Yap
                                        </Link>
                                        <Link
                                            href={`/${currentLang}/register`}
                                            className="flex items-center justify-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-primary border border-primary hover:bg-primary/10 transition-colors duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            onClick={() => setIsAccountOpen(false)}
                                        >
                                            Kayıt Ol
                                        </Link>
                                    </div>
                                )}
                            </m.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
