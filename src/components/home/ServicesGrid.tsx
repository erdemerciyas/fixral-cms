'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import HTMLContent from '../HTMLContent';
import { resolveIcon } from '../../lib/icons';
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
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.7, ease: [0.32, 0.72, 0, 1] },
    },
};

export default function ServicesGrid({ services = [] }: ServicesGridProps) {
    const lang = useLocale();

    if (!services || services.length === 0) {
        return (
            <div className="text-center py-16 mb-16">
                <p className="text-zinc-500 mb-4">Henuz hizmet bulunmuyor.</p>
                <Link href={`/${lang}/contact`} className="btn-outline">
                    Proje talebi birakin
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 mb-16"
            role="list"
            aria-live="polite"
        >
            {services.map((service, index) => {
                const IconComponent = resolveIcon(service.icon);
                const isLarge = index === 0;
                const spanClass = isLarge
                    ? 'md:col-span-8 md:row-span-2'
                    : index <= 2
                        ? 'md:col-span-4'
                        : 'md:col-span-4';

                return (
                    <motion.div
                        key={service._id}
                        variants={itemVariants}
                        className={spanClass}
                        role="listitem"
                    >
                        <Link
                            href={`/${lang}/services#${service.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}`}
                            className="group relative block h-full rounded-3xl overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.8)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(0,52,80,0.06)',
                                boxShadow: '0 1px 2px rgba(0,52,80,0.03)',
                                transition: 'all 700ms cubic-bezier(0.32, 0.72, 0, 1)',
                                minHeight: isLarge ? '360px' : '200px',
                            }}
                        >
                            {/* Spotlight border effect on hover */}
                            <div
                                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 pointer-events-none"
                                style={{
                                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.5), 0 20px 40px -15px rgba(0,52,80,0.08)',
                                    transition: 'opacity 700ms cubic-bezier(0.32, 0.72, 0, 1)',
                                }}
                            />

                            {/* Cover image for large card */}
                            {service.image && isLarge && (
                                <div className="absolute inset-0">
                                    <Image
                                        src={service.image}
                                        alt={service.title}
                                        fill
                                        className="object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105"
                                        style={{ transition: 'all 1000ms cubic-bezier(0.32, 0.72, 0, 1)' }}
                                        sizes="(max-width: 768px) 100vw, 66vw"
                                    />
                                </div>
                            )}

                            <div className={`relative z-10 flex flex-col h-full ${isLarge ? 'p-8 md:p-10' : 'p-6 md:p-7'}`}>
                                {/* Icon */}
                                <div
                                    className={`${isLarge ? 'w-14 h-14' : 'w-10 h-10'} rounded-2xl flex items-center justify-center mb-5`}
                                    style={{
                                        background: 'rgba(0,52,80,0.06)',
                                        transition: 'all 500ms cubic-bezier(0.32, 0.72, 0, 1)',
                                    }}
                                >
                                    {IconComponent && (
                                        <IconComponent className={`${isLarge ? 'w-7 h-7' : 'w-5 h-5'} text-brand-primary-800`} />
                                    )}
                                </div>

                                {/* Title */}
                                <h3
                                    className={`${isLarge ? 'text-2xl md:text-3xl' : 'text-lg'} font-semibold text-zinc-900 mb-3 group-hover:text-brand-primary-800`}
                                    style={{
                                        letterSpacing: '-0.02em',
                                        transition: 'color 500ms cubic-bezier(0.32, 0.72, 0, 1)',
                                    }}
                                >
                                    {service.title}
                                </h3>

                                {/* Description */}
                                <div className={`text-zinc-500 ${isLarge ? 'text-base' : 'text-sm'} leading-relaxed flex-1`} style={{ maxWidth: '50ch' }}>
                                    <HTMLContent
                                        content={service.description}
                                        truncate={isLarge ? 200 : 100}
                                        className={isLarge ? 'line-clamp-4' : 'line-clamp-2'}
                                    />
                                </div>

                                {/* Arrow */}
                                <div className="mt-5 flex items-center gap-2">
                                    <span className="text-sm font-medium text-zinc-400 group-hover:text-brand-primary-700"
                                        style={{ transition: 'color 500ms cubic-bezier(0.32, 0.72, 0, 1)' }}
                                    >
                                        Detaylar
                                    </span>
                                    <ArrowRight
                                        size={14}
                                        weight="bold"
                                        className="text-zinc-300 group-hover:text-brand-primary-700 group-hover:translate-x-1"
                                        style={{ transition: 'all 500ms cubic-bezier(0.32, 0.72, 0, 1)' }}
                                    />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
