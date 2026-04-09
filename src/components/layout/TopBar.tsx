'use client';

import Link from 'next/link';
import { Phone, EnvelopeSimple } from '@phosphor-icons/react';
import LanguageSwitch from '../ui/LanguageSwitch';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface TopBarProps {
    currentLang: string;
    isTransparentPage: boolean;
    visible: boolean;
}

export default function TopBar({ currentLang, isTransparentPage, visible }: TopBarProps) {
    const { t } = useAppTranslations('header');

    return (
        <div
            className="hidden lg:block relative z-10"
            style={{
                opacity: visible ? 1 : 0,
                marginTop: visible ? 0 : '-36px',
                pointerEvents: visible ? 'auto' : 'none',
                transition: 'all 500ms cubic-bezier(0.32, 0.72, 0, 1)',
            }}
        >
            <div
                style={{
                    background: isTransparentPage ? 'rgba(0,0,0,0.2)' : 'rgba(9, 20, 29, 0.95)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
            >
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="flex items-center justify-between h-9">
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/${currentLang}/contact`}
                                className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70"
                                style={{ transition: 'color 300ms cubic-bezier(0.32, 0.72, 0, 1)' }}
                            >
                                <Phone size={12} weight="light" />
                                <span>{t('contact')}</span>
                            </Link>
                            <div className="w-px h-3 bg-white/10" />
                            <a
                                href="mailto:info@fixral.com"
                                className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70"
                                style={{ transition: 'color 300ms cubic-bezier(0.32, 0.72, 0, 1)' }}
                            >
                                <EnvelopeSimple size={12} weight="light" />
                                <span>info@fixral.com</span>
                            </a>
                        </div>

                        <LanguageSwitch currentLang={currentLang} variant="topbar" />
                    </div>
                </div>
            </div>
        </div>
    );
}
