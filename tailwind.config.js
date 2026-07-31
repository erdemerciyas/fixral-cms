/** @type {import('tailwindcss').Config} */
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

        // Semantic tokens (shadcn/ui CSS variables)
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
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
          900: 'var(--brand-primary-900)',
          DEFAULT: 'var(--brand-primary-500)',
        },

        success: {
          light:   'var(--color-success-light)',
          DEFAULT: 'hsl(var(--success) / <alpha-value>)',
          dark:    'var(--color-success-dark)',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          light:   'var(--color-warning-light)',
          DEFAULT: 'hsl(var(--warning) / <alpha-value>)',
          dark:    'var(--color-warning-dark)',
          foreground: 'hsl(var(--warning-foreground))',
        },
        danger: {
          light:   'var(--color-danger-light)',
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          dark:    'var(--color-danger-dark)',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        info: {
          light:   'var(--color-info-light)',
          DEFAULT: 'hsl(var(--info) / <alpha-value>)',
          dark:    'var(--color-info-dark)',
          foreground: 'hsl(var(--info-foreground))',
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
          bg: 'var(--color-page-bg, #3f3f46)',
        },
      },
      fontFamily: {
        sans: ['var(--font-barlow)', 'var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-barlow)', 'var(--font-geist-sans)', 'system-ui', 'sans-serif'],
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
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glass': 'var(--shadow-glass)',
        'glass-lg': '0 20px 40px -15px rgba(0, 52, 80, 0.05)',
        'glass-inner': 'inset 0 1px 1px rgba(255, 255, 255, 0.15)',
        'glass-border': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'premium': 'var(--shadow-premium)',
        'premium-lg': '0 4px 6px rgba(0, 52, 80, 0.04), 0 12px 32px rgba(0, 52, 80, 0.08)',
        'premium-xl': '0 20px 40px -15px rgba(0, 52, 80, 0.12)',
        'spotlight': '0 0 0 1px rgba(0, 52, 80, 0.05), 0 20px 40px -15px rgba(0, 52, 80, 0.1)',
        'tinted-sm': 'var(--shadow-tinted-sm)',
        'tinted-md': 'var(--shadow-tinted-md)',
        'tinted-lg': 'var(--shadow-tinted-lg)',
        'tinted-xl': 'var(--shadow-xl)',
      },
      spacing: {},
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-down': 'slideDown 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
        'scale': 'scale 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'smooth-bounce': 'bounce 1s cubic-bezier(0.32, 0.72, 0, 1) infinite',
        'shimmer': 'shimmer 2.5s cubic-bezier(0.32, 0.72, 0, 1) infinite',
        'gradient-x': 'gradientX 3s ease infinite',
        'marquee': 'marquee 30s linear infinite',
        'marquee-continuous': 'marquee-continuous 25s linear infinite',
        'float': 'float 6s cubic-bezier(0.32, 0.72, 0, 1) infinite',
        'float-gentle': 'float-gentle 6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'count-up': 'count-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'mesh-rotate': 'meshRotate 20s linear infinite',
      },
      transitionProperty: {
        'transform-opacity': 'transform, opacity',
        'colors-transform': 'color, background-color, border-color, transform',
      },
      backgroundImage: {},
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
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marqueeContinuous: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      borderColor: {
        DEFAULT: 'var(--color-border)',
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
    // NOT: '@tailwindcss/aspect-ratio' kaldırıldı — eklentinin theme.aspectRatio
    // override'ı çekirdek aspect-square/aspect-video utility'lerini siliyordu
    // (fill görsellerde "height value of 0" uyarısının kök nedeni).
  ],
} 