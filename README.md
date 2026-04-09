
# FIXRAL 3D - Advanced CMS


[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-Radix-000?style=for-the-badge)](https://ui.shadcn.com/)
[![Version](https://img.shields.io/badge/Version-5.0.0-blue?style=for-the-badge)]()

**Fixral CMS** is a production-grade, full-stack Content Management System built with Next.js 14 (App Router), Prisma ORM, and PostgreSQL.

Designed for engineering portfolios, 3D printing services, and agency websites, it features a modern admin panel powered by shadcn/ui, multi-language support, and a rich content editing experience.

---

## Table of Contents

- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [UI Component Library](#ui-component-library)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Security](#security)
- [Changelog](#changelog)
- [License](#license)

---

## Key Features

### Content Management
- **Portfolio Management:** Rich project showcases with image galleries, 3D model viewer (GLB/GLTF/STL), categories, and tags
- **News / Blog:** Multi-language news articles with SEO metadata, slug-based routing, and rich text editing (Tiptap)
- **Services Module:** Dedicated page structures for engineering services (Reverse Engineering, 3D Scanning, etc.)
- **Slider Management:** Homepage hero sliders with drag-and-drop media management
- **Video Management:** YouTube integration with automatic channel sync

### Admin Panel (shadcn/ui)
- **Modern UI:** Fully migrated to shadcn/ui (Radix primitives + Tailwind) with collapsible sidebar navigation
- **Rich Text Editor:** Tiptap-based editor with tables, code blocks, images, and text alignment
- **Media Browser:** Cloudinary-powered drag-and-drop image uploads with gallery view
- **Message Center:** Reply to contact forms and project inquiries directly from the panel
- **Backup System:** JSON export/import of full site data
- **SEO Management:** Per-page meta titles, descriptions, canonical URLs, and Open Graph settings
- **Analytics Dashboard:** Site-wide statistics and content metrics
- **Theme Customization:** Live color and branding controls

### Multi-Language (i18n)
- **Full i18n Support:** All public pages under `[lang]` dynamic segments via `next-intl`
- **Supported Locales:** Turkish (tr), Spanish (es)
- **Admin Language Tabs:** Side-by-side content editing for each locale

### Portfolio & 3D Visualization
- **3D Model Viewer:** In-browser GLB/GLTF/STL model support via `@react-three/fiber`
- **Image Gallery:** Lightbox-style galleries with zoom, navigation, and thumbnail strips
- **Advanced Filtering:** Category filters, search, sorting, and pagination

### SEO & Performance
- **ISR Caching:** Incremental Static Regeneration for fast TTFB
- **Dynamic Sitemap & Robots.txt:** Auto-generated from database with up-to-date links
- **Canonical URL Management:** Independent per-page canonical URL generation
- **Hreflang Tags:** Proper multi-language SEO with hreflang alternate links
- **JSON-LD:** Dynamic structured data from database

---

## Architecture

```
Next.js 14 App Router
├── Server Components (SSR data fetching)
├── Client Components (interactive UI via shadcn/ui)
├── API Routes (public/ + admin/ separation)
├── Middleware (auth, i18n, rate limiting)
├── Prisma ORM (PostgreSQL / Neon)
└── Mongoose (legacy MongoDB models, migration adapter)
```

### Key Architectural Decisions
- **Dual ORM:** Prisma for new PostgreSQL tables + Mongoose adapter layer for migration period
- **API Separation:** `api/public/` for unauthenticated endpoints, `api/admin/` for protected ones
- **Admin UI:** shadcn/ui components (Radix + Tailwind) with collapsible sidebar layout
- **Component Strategy:** shadcn/ui primitives alongside legacy Fixral-prefixed components (gradual migration)
- **Page Templates:** Reusable admin page layout with breadcrumbs and consistent spacing

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14.2 (React 18 + App Router) |
| **Language** | TypeScript 5.6 |
| **Database** | PostgreSQL (Neon) via Prisma ORM |
| **Legacy DB** | MongoDB (Mongoose) — migration in progress |
| **Styling** | Tailwind CSS 3.4, CVA, tailwind-merge |
| **UI Library** | shadcn/ui (Radix UI primitives) |
| **Rich Text** | Tiptap (with code blocks, tables, images) |
| **Animation** | Framer Motion |
| **Icons** | Lucide React, Heroicons, Phosphor Icons |
| **3D Graphics** | Three.js, React Three Fiber |
| **Authentication** | NextAuth.js + JWT |
| **Media** | Cloudinary |
| **i18n** | next-intl |
| **Email** | Nodemailer (Gmail SMTP) |
| **Testing** | Jest, Testing Library |
| **Linting** | ESLint, Prettier |
| **CI/CD** | GitHub Actions, Vercel |

---

## UI Component Library

The admin panel uses **shadcn/ui** components built on Radix UI primitives:

| Component | Source | Description |
|-----------|--------|-------------|
| `Button` | shadcn/ui | Multiple variants: default, destructive, outline, secondary, ghost, link |
| `Input` | shadcn/ui | Form input with label support |
| `Card` | shadcn/ui | Content container with header/footer |
| `Badge` | shadcn/ui | Status indicators |
| `Dialog` | shadcn/ui | Modal dialogs |
| `Sheet` | shadcn/ui | Slide-out panels |
| `Table` | shadcn/ui | Data tables with TanStack React Table |
| `Tabs` | shadcn/ui | Tabbed navigation (language tabs) |
| `Sidebar` | shadcn/ui | Collapsible admin navigation |
| `Tooltip` | shadcn/ui | Hover tooltips |
| `Select` | shadcn/ui | Dropdown selects |
| `Switch` | shadcn/ui | Toggle switches |
| `Checkbox` | shadcn/ui | Checkboxes |
| `AlertDialog` | shadcn/ui | Confirmation dialogs |
| `ScrollArea` | shadcn/ui | Custom scrollable areas |
| `Breadcrumb` | shadcn/ui | Navigation breadcrumbs |
| `Skeleton` | shadcn/ui | Loading placeholders |
| `Sonner` | shadcn/ui | Toast notifications |

Custom components: `GlassCard`, `MagneticButton`, `ScrollReveal`, `SectionWrapper`, `EyebrowTag`, `GrainOverlay`, `UniversalEditor`, `Pagination`

---

## Project Structure

```
src/
├── app/
│   ├── [lang]/              # i18n public pages (tr, es)
│   │   ├── page.tsx         # Homepage
│   │   ├── portfolio/       # Portfolio showcase
│   │   ├── services/        # Services listing
│   │   ├── haberler/        # News (Turkish)
│   │   ├── noticias/        # News (Spanish)
│   │   ├── contact/         # Contact form
│   │   ├── account/         # User account
│   │   └── videos/          # Video gallery
│   ├── admin/               # Admin panel pages
│   │   ├── dashboard/       # Admin dashboard
│   │   ├── analytics/       # Analytics dashboard
│   │   ├── news/            # News management
│   │   ├── portfolio/       # Portfolio management
│   │   ├── services/        # Service management
│   │   ├── categories/      # Category management
│   │   ├── models/          # 3D model management
│   │   ├── media/           # Media library
│   │   ├── slider/          # Slider management
│   │   ├── videos/          # Video management
│   │   ├── messages/        # Contact messages
│   │   ├── seo/             # SEO settings
│   │   ├── social-media/    # Social media links
│   │   ├── theme-customize/ # Theme customization
│   │   ├── site-settings/   # Site configuration
│   │   ├── languages/       # Language management
│   │   ├── users/           # User management
│   │   ├── backup/          # Backup / restore
│   │   └── monitoring/      # Performance monitoring
│   ├── api/
│   │   ├── public/          # Unauthenticated API routes
│   │   └── admin/           # Protected API routes
│   ├── globals.css          # CSS variables & global styles
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # shadcn/ui + custom components
│   ├── admin/               # Admin-specific components
│   ├── home/                # Homepage components
│   ├── portfolio/           # Portfolio components
│   ├── news/                # News components
│   ├── layout/              # Navigation, TopBar, Footer
│   └── common/              # Shared components
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities, Prisma client, services
├── models/                  # Mongoose models (legacy)
├── prisma/                  # Prisma schema & seed
├── messages/                # i18n translation files
├── types/                   # TypeScript type definitions
└── styles/                  # Design tokens
```

---

## Getting Started

### Prerequisites
- **Node.js** v20 or higher
- **npm** v9+
- **PostgreSQL** database (recommended: [Neon](https://neon.tech/))
- **Cloudinary** account (for image uploads)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/erdemerciyas/fixral-cms.git
cd fixral-cms

# 2. Install dependencies
npm install

# 3. Create .env.local
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# 5. Seed initial data (optional)
npm run db:seed

# 6. Start development server
npm run dev
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-xxxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://user:password@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require

# Authentication
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=personal-blog

# Gmail SMTP (Email)
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# YouTube API
YOUTUBE_API_KEY=your-youtube-api-key
YOUTUBE_CHANNEL_ID=your-channel-id

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password

# Vercel (Production)
VERCEL_URL=your-vercel-url
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run type-check` | TypeScript type checking |
| `npm run clean` | Remove .next and out directories |
| `npm run format` | Format code with Prettier |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run Prisma migrations |
| `npm run prisma:push` | Push schema to database |
| `npm run db:seed` | Seed database with initial data |
| `npm run deploy` | Deploy to Vercel (production) |
| `npm run deploy:preview` | Deploy preview to Vercel |

---

## Deployment

### Vercel (Recommended)

```bash
npm run deploy
```

Ensure all environment variables are configured in the Vercel dashboard. The PostgreSQL database (Neon) should be accessible from Vercel's network.

### CI/CD Pipeline

The project includes a GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`):

1. **Code Quality** - ESLint, TypeScript type-checking, security audit
2. **Build** - Production build with environment fallbacks
3. **Deploy** - Automatic deployment to Vercel on `main` branch push

Required GitHub Secrets:
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `NEXTAUTH_SECRET` - NextAuth secret key
- `DATABASE_URL` - PostgreSQL connection string

---

## Security

- **Data Validation:** Zod schemas on all API endpoints
- **XSS Protection:** DOMPurify + sanitize-html on user content
- **Authentication:** NextAuth.js with JWT strategy and role-based access
- **Middleware Security:** IP blocking, rate limiting, and authorization checks
- **Content Security:** Semantic HTML with proper ARIA attributes

---

## Changelog

### v5.0.0 - Prisma Migration & shadcn/ui Redesign
- **Database Migration:** PostgreSQL (Neon) via Prisma ORM, replacing MongoDB as primary database
- **Admin Panel Redesign:** Full migration to shadcn/ui component library (Radix + Tailwind)
- **Removed E-Commerce:** Product catalog, cart, checkout, and order management removed
- **Removed Plugin/Theme Systems:** Simplified architecture by removing PluginRegistry and ThemeRegistry
- **New Admin Pages:** Analytics dashboard, SEO management, Social media settings, Theme customization
- **Rich Text Editor:** Tiptap integration with tables, code blocks, images, and text alignment
- **Collapsible Sidebar:** shadcn/ui sidebar with grouped navigation sections
- **New UI Components:** GlassCard, MagneticButton, ScrollReveal, SectionWrapper, EyebrowTag

### v4.3.0 - Project Cleanup & CI/CD Optimization
- Removed stray build artifacts and nested `.next` directories
- Removed temporary migration scripts
- Updated `.gitignore` with comprehensive patterns
- Simplified CI/CD pipeline
- Updated Node.js prerequisite to v20

### v4.2.0 - Dynamic Site Settings & SEO
- Dynamic `<title>` and `<meta description>` from database
- New `logoText` field in `SiteSettings` for brand name in navigation
- Dynamic JSON-LD structured data from database

### v4.1.0 - Modern Navigation & Icon Management
- Desktop nav redesign with framer-motion sliding active indicator
- Mobile nav slide-in drawer with headlessui Dialog
- Admin icon picker for page editor with visual Heroicons grid

### v4.0.0 - UI/UX Architecture Refactor
- Token-based design system (CSS variables, Tailwind config, TypeScript tokens)
- CVA-powered atomic components
- Full semantic HTML migration
- ESLint `jsx-a11y/recommended` enforcement

### v3.7.0 - Modular Architecture
- Full i18n integration with `[lang]` dynamic segments
- API endpoints separated into `public/` and `admin/`
- SSR migration for portfolio pages

---

## License

This project is proprietary software. All rights reserved. Unauthorized copying, distribution, or modification is strictly prohibited.

**Developer:** Erdem Erciyas
