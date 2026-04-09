'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CaretLeft, CaretRight, Pause, Play } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '@/hooks/useLocale';

interface SliderItem {
    _id: string;
    title: string;
    subtitle?: string;
    description: string;
    image: string;
    buttonText?: string;
    buttonLink?: string;
    badge?: string;
    duration?: number;
}

interface HeroSliderProps {
    items: SliderItem[];
}

const defaultSlider: SliderItem[] = [
    {
        _id: 'default-hero',
        title: 'Muhendislik Cozumleri',
        subtitle: '3D Tarama & Tersine Muhendislik',
        description: 'Profesyonel 3D tarama, modelleme ve prototipleme hizmetleri ile projelerinizi hayata gecirin.',
        image: 'https://picsum.photos/seed/fixral-hero/1920/1080',
        buttonText: 'Projelerimizi Inceleyin',
        buttonLink: '/portfolio'
    }
];

const textVariants = {
    enter: { opacity: 0, y: 30, filter: 'blur(8px)' },
    center: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -20, filter: 'blur(4px)' },
};

export default function HeroSlider({ items = [] }: HeroSliderProps) {
    const lang = useLocale();
    const sliderItems = items.length > 0 ? items : defaultSlider;

    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (!isPlaying || sliderItems.length <= 1) return;
        const duration = sliderItems[currentSlideIndex]?.duration || 6000;
        const timer = setInterval(() => {
            setCurrentSlideIndex((prev) => (prev + 1) % sliderItems.length);
        }, duration);
        return () => clearInterval(timer);
    }, [currentSlideIndex, isPlaying, sliderItems]);

    const nextSlide = () => {
        if (isTransitioning || sliderItems.length <= 1) return;
        setIsTransitioning(true);
        setCurrentSlideIndex((prev) => (prev + 1) % sliderItems.length);
        setTimeout(() => setIsTransitioning(false), 600);
    };

    const prevSlide = () => {
        if (isTransitioning || sliderItems.length <= 1) return;
        setIsTransitioning(true);
        setCurrentSlideIndex((prev) => (prev - 1 + sliderItems.length) % sliderItems.length);
        setTimeout(() => setIsTransitioning(false), 600);
    };

    const goToSlide = (index: number) => {
        if (isTransitioning || index === currentSlideIndex) return;
        setIsTransitioning(true);
        setCurrentSlideIndex(index);
        setTimeout(() => setIsTransitioning(false), 600);
    };

    const currentSlide = sliderItems[currentSlideIndex] || defaultSlider[0];

    if (!isMounted) {
        return (
            <div className="bg-mesh-dark flex items-center justify-center" style={{ minHeight: '100dvh' }}>
                <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" />
            </div>
        );
    }

    return (
        <header
            className="relative overflow-hidden flex items-center"
            style={{ minHeight: '100dvh' }}
            role="banner"
            aria-label="Ana hero bolumu"
        >
            {/* Background Images */}
            <div className="absolute inset-0">
                {sliderItems.map((slide, index) => (
                    <div
                        key={slide._id}
                        className="absolute inset-0"
                        style={{
                            opacity: index === currentSlideIndex ? 1 : 0,
                            transform: index === currentSlideIndex ? 'scale(1)' : 'scale(1.05)',
                            transition: 'all 1200ms cubic-bezier(0.32, 0.72, 0, 1)',
                        }}
                    >
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                            sizes="100vw"
                        />
                    </div>
                ))}
                {/* Gradient overlay -- deeper, more sophisticated */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#09141d]/95 via-[#09141d]/70 to-[#09141d]/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09141d]/90 via-transparent to-[#09141d]/30" />

                {/* Mesh gradient accent orbs */}
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, rgba(0,105,161,0.3) 0%, transparent 70%)' }} />
                <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full opacity-15"
                    style={{ background: 'radial-gradient(circle, rgba(0,52,80,0.4) 0%, transparent 70%)' }} />
            </div>

            {/* Slider Navigation */}
            {sliderItems.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white/30"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(8px)',
                            transition: 'all 500ms cubic-bezier(0.32, 0.72, 0, 1)',
                        }}
                        disabled={isTransitioning}
                        aria-label="Onceki slayt"
                    >
                        <CaretLeft size={20} weight="light" className="text-white/60" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white/30"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(8px)',
                            transition: 'all 500ms cubic-bezier(0.32, 0.72, 0, 1)',
                        }}
                        disabled={isTransitioning}
                        aria-label="Sonraki slayt"
                    >
                        <CaretRight size={20} weight="light" className="text-white/60" />
                    </button>
                </>
            )}

            {/* Content -- asymmetric left-aligned per taste-skill DESIGN_VARIANCE 8 */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-32 md:py-0">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-7 lg:col-span-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlideIndex}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                            >
                                {/* Eyebrow badge */}
                                {currentSlide.badge && (
                                    <motion.span
                                        variants={textVariants}
                                        transition={{ delay: 0 }}
                                        className="inline-flex items-center rounded-full px-3.5 py-1 text-[11px] uppercase font-medium tracking-[0.15em] mb-6"
                                        style={{
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            color: 'rgba(255,255,255,0.7)',
                                            background: 'rgba(255,255,255,0.04)',
                                        }}
                                    >
                                        {currentSlide.badge}
                                    </motion.span>
                                )}

                                {/* Title -- massive, left-aligned */}
                                <motion.h1
                                    variants={textVariants}
                                    transition={{ delay: 0.05 }}
                                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
                                    style={{
                                        letterSpacing: '-0.04em',
                                        lineHeight: 1.05,
                                        textWrap: 'balance',
                                    }}
                                >
                                    {currentSlide.title}
                                </motion.h1>

                                {/* Subtitle */}
                                {currentSlide.subtitle && (
                                    <motion.p
                                        variants={textVariants}
                                        transition={{ delay: 0.1 }}
                                        className="text-xl md:text-2xl font-normal mb-6"
                                        style={{ color: 'rgba(255,255,255,0.5)' }}
                                    >
                                        {currentSlide.subtitle}
                                    </motion.p>
                                )}

                                {/* Description */}
                                <motion.p
                                    variants={textVariants}
                                    transition={{ delay: 0.15 }}
                                    className="text-base md:text-lg leading-relaxed mb-10 max-w-lg"
                                    style={{ color: 'rgba(255,255,255,0.4)' }}
                                >
                                    {currentSlide.description}
                                </motion.p>

                                {/* CTAs -- Button-in-Button pattern */}
                                <motion.nav
                                    variants={textVariants}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-col sm:flex-row gap-4 items-start"
                                    aria-label="Hero eylem navigasyonu"
                                >
                                    <Link
                                        href={currentSlide.buttonLink || `/${lang}/portfolio`}
                                        className="group inline-flex items-center gap-3 rounded-full font-medium text-sm active:scale-[0.98]"
                                        style={{
                                            background: 'rgba(255,255,255,0.95)',
                                            color: '#09141d',
                                            padding: '12px 8px 12px 24px',
                                            transition: 'all 500ms cubic-bezier(0.32, 0.72, 0, 1)',
                                        }}
                                    >
                                        <span>{currentSlide.buttonText || 'Projelerimizi Inceleyin'}</span>
                                        <span
                                            className="w-8 h-8 rounded-full flex items-center justify-center"
                                            style={{
                                                background: 'rgba(0,52,80,0.08)',
                                                transition: 'all 300ms cubic-bezier(0.32, 0.72, 0, 1)',
                                            }}
                                        >
                                            <ArrowRight
                                                size={14}
                                                weight="bold"
                                                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-[1px]"
                                            />
                                        </span>
                                    </Link>

                                    <Link
                                        href={`/${lang}/contact`}
                                        className="inline-flex items-center gap-2 rounded-full font-medium text-sm active:scale-[0.98]"
                                        style={{
                                            color: 'rgba(255,255,255,0.6)',
                                            padding: '12px 24px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            transition: 'all 500ms cubic-bezier(0.32, 0.72, 0, 1)',
                                        }}
                                    >
                                        Iletisime Gecin
                                    </Link>
                                </motion.nav>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right side -- empty for background image focus, or future 3D element */}
                    <div className="hidden md:block md:col-span-5 lg:col-span-6" />
                </div>
            </div>

            {/* Bottom bar -- slide indicators + play/pause */}
            <div className="absolute bottom-0 left-0 right-0 z-20">
                <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 pb-8">
                    <div className="flex items-center gap-4">
                        {sliderItems.length > 1 && (
                            <>
                                <div className="flex items-center gap-2">
                                    {sliderItems.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => goToSlide(index)}
                                            className="group relative h-1 rounded-full overflow-hidden focus:outline-none"
                                            style={{
                                                width: index === currentSlideIndex ? '32px' : '16px',
                                                background: 'rgba(255,255,255,0.15)',
                                                transition: 'width 500ms cubic-bezier(0.32, 0.72, 0, 1)',
                                            }}
                                            aria-label={`Slayt ${index + 1}'e git`}
                                        >
                                            {index === currentSlideIndex && (
                                                <motion.div
                                                    layoutId="hero-dot"
                                                    className="absolute inset-0 rounded-full bg-white"
                                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full focus:outline-none"
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                    }}
                                    aria-label={isPlaying ? 'Duraklat' : 'Oynat'}
                                >
                                    {isPlaying ? (
                                        <Pause size={12} weight="fill" className="text-white/50" />
                                    ) : (
                                        <Play size={12} weight="fill" className="text-white/50" />
                                    )}
                                </button>

                                <span className="text-[11px] font-mono text-white/30">
                                    {String(currentSlideIndex + 1).padStart(2, '0')} / {String(sliderItems.length).padStart(2, '0')}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
