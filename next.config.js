const path = require('path');
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Sentry opsiyonel: Paket yoksa no-op ile devam et
let withSentryConfig = (config) => config;
try {
  const sentry = require('@sentry/nextjs');
  if (sentry && sentry.withSentryConfig) {
    withSentryConfig = sentry.withSentryConfig;
  }
} catch (e) {
  console.warn('Sentry not installed, skipping Sentry configuration');
}

// Bundle analyzer opsiyonel: Paket yoksa no-op ile devam et
let withBundleAnalyzer = (config) => config;
try {
  const bundleAnalyzerFactory = require('@next/bundle-analyzer');
  if (bundleAnalyzerFactory && typeof bundleAnalyzerFactory === 'function') {
    withBundleAnalyzer = bundleAnalyzerFactory({
      enabled: process.env.ANALYZE === 'true',
    });
  }
} catch (e) {
  console.warn('Bundle analyzer not installed, skipping bundle analysis');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Eski hizmet kayıtlarının slug'ları yeni katalog adreslerine kalıcı yönlenir
  // (kaynak: src/content/fixral.ts → SERVICES[].dbSlugs). Redesign 2026.
  async redirects() {
    return [
      { source: '/tr/services/plastik-restorasyon', destination: '/tr/services/3d-tarama', permanent: true },
      { source: '/tr/services/restorasyon-danismanlik', destination: '/tr/services/tersine-muhendislik', permanent: true },
      { source: '/tr/services/extreme-ecu-cozumleri', destination: '/tr/services/otomotiv-elektronigi', permanent: true },
      { source: '/tr/services/arac-restorasyon', destination: '/tr/services/otomotiv-elektronigi', permanent: true },
      { source: '/tr/services/3d-modelleme-hizmetleri', destination: '/tr/services/cad-3d-cizim', permanent: true },
      { source: '/tr/services/3d-baski-hizmetleri', destination: '/tr/services/3d-baski', permanent: true },
      { source: '/tr/services/prototipleme-hizmetleri', destination: '/tr/services/3d-baski', permanent: true },
      { source: '/tr/services/kurumsal-bireysel-yazilim', destination: '/tr/services/cnc-cam', permanent: true },
    ];
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Vercel optimizations
  // NOT: Turbopack ile uyumsuz özelleştirmeler (opsiyonel Sentry externals, glb/gltf file-loader)
  // nedeniyle build/dev script'leri --webpack bayrağıyla çalışır (bkz. package.json).
  webpack: (config) => {
    // Path aliases için webpack alias ekleme
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/models': path.resolve(__dirname, 'src/models'),
      '@/types': path.resolve(__dirname, 'src/types'),
    };

    // Optional dependencies - mark as external to avoid build errors
    config.externals.push({
      '@sentry/nextjs': 'commonjs @sentry/nextjs',
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

    // Three.js için webpack konfigürasyonu
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/models/',
          outputPath: 'static/models/',
        },
      },
    });

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        // YouTube küçük resimleri (anasayfa haber/video şeridi)
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
      {
        // FX 3D: Cults3D model görselleri ve dosya önizlemeleri
        protocol: 'https',
        hostname: 'images.cults3d.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
    // Security: Limit image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Security: Disable external image optimization for untrusted sources
    dangerouslyAllowSVG: false,
    // Performance: Enable image optimization
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  experimental: {
    // Keep minimal experiments to avoid chunking issues on Windows builds
    scrollRestoration: true,
    // Tree-shaking yardımı: barrel import'ları kullanılan modüllere indirger
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
    ],
  },
  // Performance: Enable compression
  compress: true,
  // Security headers are applied via proxy for single-source of truth
  // Security: Disable powered by header
  poweredByHeader: false,
  // Security: Disable server-side includes
  trailingSlash: false,
}

// Sentry configuration (only if Sentry is available)
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin
  silent: process.env.NODE_ENV === 'production',
  hideSourceMaps: true,
  widenClientFileUpload: true,
};

// Apply configurations in order
let finalConfig = nextConfig;
finalConfig = withBundleAnalyzer(finalConfig);

// Only apply Sentry if it's available
if (withSentryConfig !== ((config) => config)) {
  finalConfig = withSentryConfig(finalConfig, sentryWebpackPluginOptions);
}

module.exports = withNextIntl(finalConfig);