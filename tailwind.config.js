/** @type {import('tailwindcss').Config} */
const siteConfig = require('./site.config');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── shadcn/ui Token Colors ──
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },

        // Fixral Design System Colors - Loaded from site.config.js
        fixral: {
          ...siteConfig.theme.colors.brand,
          'primary': 'var(--theme-primary)',
        },
        // Backward compatibility - Use CSS custom properties for dynamic theme colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          legacy: 'var(--theme-primary)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          legacy: 'var(--theme-secondary)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          legacy: 'var(--theme-accent)',
        },

        // Primary brand colors - Use CSS custom property for the base color
        'brand-primary': {
          50: 'var(--brand-primary-50)',
          100: 'var(--brand-primary-100)',
          200: 'var(--brand-primary-200)',
          300: 'var(--brand-primary-300)',
          400: 'var(--brand-primary-400)',
          500: 'var(--brand-primary-500)',
          600: 'var(--brand-primary-600)',
          700: 'var(--brand-primary-700)',
          800: 'var(--brand-primary-800)',
          900: 'var(--theme-primary)',
          DEFAULT: 'var(--theme-primary)',
        },

        // Admin specific colors
        admin: {
          bg: 'var(--admin-bg)',
          surface: 'var(--admin-surface)',
          border: 'var(--admin-border)',
          'text-primary': 'var(--admin-text-primary)',
          'text-secondary': 'var(--admin-text-secondary)',
        },

        // ── Design System: Semantic Colors (CSS variable based) ──
        brand: {
          50:  'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
          800: 'var(--color-brand-800)',
          900: 'var(--color-brand-900)',
        },
        success: {
          light:   'var(--color-success-light)',
          DEFAULT: 'var(--color-success)',
          dark:    'var(--color-success-dark)',
        },
        warning: {
          light:   'var(--color-warning-light)',
          DEFAULT: 'var(--color-warning)',
          dark:    'var(--color-warning-dark)',
        },
        danger: {
          light:   'var(--color-danger-light)',
          DEFAULT: 'var(--color-danger)',
          dark:    'var(--color-danger-dark)',
        },
        info: {
          light:   'var(--color-info-light)',
          DEFAULT: 'var(--color-info)',
          dark:    'var(--color-info-dark)',
        },
        surface: {
          primary:   'var(--color-surface-primary)',
          secondary: 'var(--color-surface-secondary)',
          tertiary:  'var(--color-surface-tertiary)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong:  'var(--color-border-strong)',
          subtle:  'var(--color-border-subtle)',
        },
        social: {
          twitter:  '#1DA1F2',
          facebook: '#4267B2',
          linkedin: '#0077b5',
        },
        page: {
          bg: '#f6f7f9',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'atlas-2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        'atlas-3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.01em' }],
        'atlas-4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        'atlas-5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'fixral': '8px',
        'fixral-lg': '12px',
        'fixral-xl': '16px',
        'fixral-2xl': '20px',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'fixral': '0 2px 6px rgba(0, 0, 0, 0.05)',
        'fixral-lg': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'fixral-xl': '0 8px 24px rgba(0, 0, 0, 0.15)',
        'fixral-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        'fixral-glow': '0 0 20px rgba(0, 180, 216, 0.3)',
        'glass': '0 8px 32px rgba(0, 52, 80, 0.08)',
        'glass-lg': '0 20px 40px -15px rgba(0, 52, 80, 0.05)',
        'glass-inner': 'inset 0 1px 1px rgba(255, 255, 255, 0.15)',
        'glass-border': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'premium': '0 1px 2px rgba(0, 52, 80, 0.04), 0 4px 12px rgba(0, 52, 80, 0.06)',
        'premium-lg': '0 4px 6px rgba(0, 52, 80, 0.04), 0 12px 32px rgba(0, 52, 80, 0.08)',
        'premium-xl': '0 20px 40px -15px rgba(0, 52, 80, 0.12)',
        'spotlight': '0 0 0 1px rgba(0, 52, 80, 0.05), 0 20px 40px -15px rgba(0, 52, 80, 0.1)',
      },
      spacing: {
        'fixral-xs': '0.5rem',
        'fixral-sm': '1rem',
        'fixral-md': '1.5rem',
        'fixral-lg': '2rem',
        'fixral-xl': '3rem',
        'fixral-2xl': '4rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-down': 'slideDown 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
        'scale': 'scale 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'smooth-bounce': 'bounce 1s cubic-bezier(0.32, 0.72, 0, 1) infinite',
        'shimmer': 'shimmer 2.5s cubic-bezier(0.32, 0.72, 0, 1) infinite',
        'gradient-x': 'gradientX 3s ease infinite',
        'marquee': 'marquee 30s linear infinite',
        'float': 'float 6s cubic-bezier(0.32, 0.72, 0, 1) infinite',
        'mesh-rotate': 'meshRotate 20s linear infinite',
      },
      transitionProperty: {
        'transform-opacity': 'transform, opacity',
        'colors-transform': 'color, background-color, border-color, transform',
      },
      backgroundImage: {
        'fixral-gradient': 'linear-gradient(135deg, #0D1B2A 0%, #3A506B 100%)',
        'fixral-gradient-light': 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
        'fixral-gradient-turquoise': 'linear-gradient(135deg, #00B4D8 0%, #0077BE 100%)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scale: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        meshRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      borderColor: {
        DEFAULT: '#cbd5e1', // slate-300
      },
      // ── Design System: Transition Durations ──
      transitionDuration: {
        fast: '100ms',
        base: '150ms',
        slow: '300ms',
        premium: '700ms',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.32, 0.72, 0, 1)',
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      // ── Design System: Z-Index Scale ──
      zIndex: {
        dropdown: '1000',
        sticky:   '1020',
        fixed:    '1030',
        modal:    '1050',
        popover:  '1070',
        tooltip:  '1080',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
} 