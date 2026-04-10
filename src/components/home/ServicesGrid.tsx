'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import HTMLContent from '../HTMLContent';
import { resolveIconForService } from '../../lib/icons';
import { useLocale } from '@/hooks/useLocale';

interface ServiceItem {
    _id: string;
    title: string;
    description: string;
    image?: string;
    icon?: string;
    features?: string[];
}

interface ServicesGridProps {
    services: ServiceItem[];
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
};

const accentColors = [
    { border: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', text: '#0ea5e9', glow: 'rgba(14,165,233,0.15)' },
    { border: '#10b981', bg: 'rgba(16,185,129,0.08)', text: '#10b981', glow: 'rgba(16,185,129,0.15)' },
    { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', text: '#f59e0b', glow: 'rgba(245,158,11,0.15)' },
    { border: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', text: '#8b5cf6', glow: 'rgba(139,92,246,0.15)' },
    { border: '#ef4444', bg: 'rgba(239,68,68,0.08)', text: '#ef4444', glow: 'rgba(239,68,68,0.15)' },
    { border: '#06b6d4', bg: 'rgba(6,182,212,0.08)', text: '#06b6d4', glow: 'rgba(6,182,212,0.15)' },
];

export default function ServicesGrid({ services = [] }: ServicesGridProps) {
    const lang = useLocale();

    if (!services || services.length === 0) {
        return (
            <div className="text-center py-16 mb-16">
                <p className="text-zinc-500 mb-4">Henüz hizmet bulunmuyor.</p>
                <Link href={`/${lang}/contact`} className="btn-outline">
                    Proje talebi bırakın
                </Link>
            </div>
        );
    }

    const featured = services[0];
    const rest = services.slice(1);
    const FeaturedIcon = resolveIconForService(featured?.icon, featured?.title);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-16"
            role="list"
            aria-live="polite"
        >
            {/* Featured / Hero Service Card */}
            <motion.div variants={itemVariants} className="mb-5" role="listitem">
                <Link
                    href={`/${lang}/services#${featured.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl"
                    style={{ minHeight: '340px' }}
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'linear-gradient(135deg, #0c1a24 0%, #003450 50%, #001f30 100%)',
                        }}
                    />

                    {featured.image && (
                        <div className="absolute inset-0">
                            <Image
                                src={featured.image}
                                alt={featured.title}
                                fill
                                className="object-cover opacity-25 group-hover:opacity-35 group-hover:scale-[1.03]"
                                style={{ transition: 'all 1200ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                                sizes="(max-width: 768px) 100vw, 100vw"
                            />
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(180deg, rgba(12,26,36,0.3) 0%, rgba(12,26,36,0.85) 100%)',
                                }}
                            />
                        </div>
                    )}

                    <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${accentColors[0].border}, transparent)` }} />

                    <div className="relative z-10 flex flex-col justify-between p-8 md:p-12 flex-1">
                        <div className="flex items-start justify-between gap-6">
                            <div>
                                <div
                                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                                    style={{
                                        background: accentColors[0].bg,
                                        border: `1px solid ${accentColors[0].border}30`,
                                        boxShadow: `0 0 20px ${accentColors[0].glow}`,
                                    }}
                                >
                                    {FeaturedIcon && (
                                        <FeaturedIcon className="w-7 h-7" style={{ color: accentColors[0].text }} />
                                    )}
                                </div>

                                <h3
                                    className="text-2xl md:text-3xl lg:text-4xl font-bold text-white group-hover:text-sky-300"
                                    style={{
                                        letterSpacing: '-0.03em',
                                        lineHeight: 1.15,
                                        transition: 'color 600ms cubic-bezier(0.22, 1, 0.36, 1)',
                                    }}
                                >
                                    {featured.title}
                                </h3>
                            </div>

                        </div>

                        {featured.features && featured.features.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-auto pt-6">
                                {featured.features.slice(0, 4).map((feature, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                                        style={{
                                            background: 'rgba(255,255,255,0.06)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            color: 'rgba(255,255,255,0.6)',
                                        }}
                                    >
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </Link>
            </motion.div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {rest.map((service, index) => {
                    const IconComponent = resolveIconForService(service.icon, service.title);
                    const accent = accentColors[(index + 1) % accentColors.length];

                    return (
                        <motion.div
                            key={service._id}
                            variants={itemVariants}
                            role="listitem"
                        >
                            <Link
                                href={`/${lang}/services#${service.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}`}
                                className="group relative block h-full rounded-2xl overflow-hidden"
                                style={{
                                    background: '#fafbfc',
                                    border: '1px solid rgba(0,52,80,0.08)',
                                    transition: 'all 600ms cubic-bezier(0.22, 1, 0.36, 1)',
                                }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget;
                                    el.style.borderColor = accent.border + '40';
                                    el.style.boxShadow = `0 8px 32px -8px ${accent.glow}, 0 1px 3px rgba(0,0,0,0.04)`;
                                    el.style.transform = 'translateY(-4px)';
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget;
                                    el.style.borderColor = 'rgba(0,52,80,0.08)';
                                    el.style.boxShadow = 'none';
                                    el.style.transform = 'translateY(0)';
                                }}
                            >
                                {/* Cover Image */}
                                <div className="relative w-full overflow-hidden" style={{ height: '140px' }}>
                                    {service.image ? (
                                        <>
                                            <Image
                                                src={service.image}
                                                alt={service.title}
                                                fill
                                                className="object-cover group-hover:scale-[1.06]"
                                                style={{ transition: 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                                            />
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    background: `linear-gradient(180deg, transparent 40%, rgba(250,251,252,0.9) 100%)`,
                                                }}
                                            />
                                        </>
                                    ) : (
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background: `linear-gradient(135deg, ${accent.bg} 0%, ${accent.border}12 100%)`,
                                            }}
                                        />
                                    )}

                                    {/* Icon overlay on image */}
                                    <div
                                        className="absolute bottom-3 left-4 w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{
                                            background: 'rgba(255,255,255,0.92)',
                                            backdropFilter: 'blur(8px)',
                                            border: `1px solid ${accent.border}30`,
                                            boxShadow: `0 2px 8px rgba(0,0,0,0.08)`,
                                        }}
                                    >
                                        {IconComponent && (
                                            <IconComponent
                                                className="w-5 h-5"
                                                style={{ color: accent.text }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Accent line */}
                                <div
                                    className="h-[2px]"
                                    style={{
                                        background: `linear-gradient(90deg, ${accent.border}, ${accent.border}20)`,
                                        opacity: 0.5,
                                        transition: 'opacity 400ms ease',
                                    }}
                                />
                                <div
                                    className="absolute h-[2px] left-0 right-0 opacity-0 group-hover:opacity-100"
                                    style={{
                                        top: '140px',
                                        background: accent.border,
                                        transition: 'opacity 400ms ease',
                                    }}
                                />

                                {/* Content */}
                                <div className="relative z-10 flex flex-col p-5 pt-4">
                                    <h3
                                        className="text-[15px] font-semibold text-zinc-800 mb-2 group-hover:text-zinc-950"
                                        style={{
                                            letterSpacing: '-0.01em',
                                            lineHeight: 1.3,
                                            transition: 'color 400ms ease',
                                        }}
                                    >
                                        {service.title}
                                    </h3>

                                    <div className="text-zinc-500 text-[13px] leading-relaxed flex-1 mb-3">
                                        <HTMLContent
                                            content={service.description}
                                            truncate={80}
                                            className="line-clamp-2"
                                        />
                                    </div>

                                    <div className="flex items-center gap-1.5 mt-auto">
                                        <span
                                            className="text-[13px] font-medium"
                                            style={{
                                                color: accent.text,
                                                opacity: 0.7,
                                                transition: 'opacity 400ms ease',
                                            }}
                                        >
                                            Detaylar
                                        </span>
                                        <ArrowRight
                                            size={13}
                                            weight="bold"
                                            className="group-hover:translate-x-1"
                                            style={{
                                                color: accent.text,
                                                opacity: 0.7,
                                                transition: 'all 400ms cubic-bezier(0.22, 1, 0.36, 1)',
                                            }}
                                        />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
