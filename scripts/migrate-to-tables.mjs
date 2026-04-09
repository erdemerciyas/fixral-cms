/**
 * Migration script: Document table → dedicated relational tables
 *
 * Reads all rows from the Document table and inserts them into their
 * corresponding dedicated tables. Safe to re-run (uses upsert).
 *
 * Usage: node scripts/migrate-to-tables.mjs
 * Requires DATABASE_URL and DIRECT_URL environment variables.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Extract common fields from Document.data JSON */
function extract(doc) {
  const d = (typeof doc.data === 'object' && doc.data) || {};
  return {
    d,
    id: String(d._id || doc.id),
    createdAt: d.createdAt ? new Date(d.createdAt) : doc.createdAt,
    updatedAt: d.updatedAt ? new Date(d.updatedAt) : doc.updatedAt,
  };
}

// ── Phase 1: Singletons & Standalone ────────────────────────────────

async function migrateSiteSettings(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.siteSettingsRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        siteName: d.siteName ?? '',
        logoText: d.logoText ?? '',
        slogan: d.slogan ?? '',
        description: d.description ?? '',
        favicon: d.favicon ?? '',
        siteUrl: d.siteUrl ?? '',
        timezone: d.timezone ?? 'Europe/Istanbul',
        language: d.language ?? 'tr',
        maintenanceMode: d.maintenanceMode ?? false,
        allowRegistration: d.allowRegistration ?? true,
        enableComments: d.enableComments ?? true,
        isActive: d.isActive ?? true,
        logo: d.logo ?? {},
        colors: d.colors ?? {},
        socialMedia: d.socialMedia ?? {},
        seo: d.seo ?? {},
        contact: d.contact ?? {},
        analytics: d.analytics ?? {},
        system: d.system ?? {},
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migrateFooterSettings(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.footerSettingsRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        mainDescription: d.mainDescription ?? '',
        contactInfo: d.contactInfo ?? {},
        quickLinks: d.quickLinks ?? [],
        socialLinks: d.socialLinks ?? {},
        copyrightInfo: d.copyrightInfo ?? {},
        developerInfo: d.developerInfo ?? {},
        visibility: d.visibility ?? {},
        theme: d.theme ?? {},
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migrateSettings(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    // Settings may be key-value or a single config object
    const key = d.key || d.siteName || id;
    await prisma.settingRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        key: String(key),
        value: d,
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migrateContentSettings(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    const key = d.key || id;
    await prisma.contentSettingRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        key: String(key),
        value: d.value ?? d,
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migratePageSetting(docs) {
  const seen = new Set();
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    const pageId = d.pageId || id;
    if (seen.has(pageId)) continue;
    seen.add(pageId);
    await prisma.pageSettingRow.upsert({
      where: { pageId },
      update: {},
      create: {
        id,
        pageId,
        config: d.config || d,
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migratePageSettings(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.pageSettingsRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        key: d.key || id,
        value: d.value ?? d,
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migratePageTemplate(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.pageTemplateRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: d.name ?? '',
        slug: d.slug ?? id,
        layout: d.layout ?? {},
        isActive: d.isActive ?? true,
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migrateLanguage(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.languageRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        code: d.code ?? '',
        label: d.label ?? '',
        nativeLabel: d.nativeLabel ?? '',
        flag: d.flag ?? '',
        isDefault: d.isDefault ?? false,
        isActive: d.isActive ?? true,
        direction: d.direction ?? 'ltr',
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migrateAbout(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.aboutRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        title: d.title ?? '',
        description: d.description ?? '',
        image: d.image ?? '',
        gallery: Array.isArray(d.gallery) ? d.gallery : [],
        createdAt,
        updatedAt,
      },
    });
  }
}

// ── Phase 2: User & Simple Entities ─────────────────────────────────

async function migrateUser(docs) {
  const seen = new Set();
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    const email = d.email ?? '';
    if (!email || seen.has(email)) continue;
    seen.add(email);
    await prisma.userRow.upsert({
      where: { email },
      update: {},
      create: {
        id,
        name: d.name ?? '',
        email,
        password: d.password ?? '',
        role: d.role ?? 'user',
        isActive: d.isActive ?? true,
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migrateCategory(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.categoryRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: d.name ?? '',
        description: d.description ?? '',
        slug: d.slug ?? id,
        isActive: d.isActive ?? true,
        order: Number(d.order) || 0,
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migrateContact(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.contactRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: d.name ?? '',
        email: d.email ?? '',
        phone: d.phone ?? '',
        subject: d.subject ?? '',
        message: d.message ?? '',
        status: d.status ?? 'new',
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migrateTheme(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.themeRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: d.name ?? '',
        slug: d.slug ?? id,
        version: d.version ?? '1.0.0',
        author: d.author ?? '',
        description: d.description ?? '',
        thumbnail: d.thumbnail ?? '',
        isActive: d.isActive ?? false,
        config: d.config ?? {},
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migratePlugin(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.pluginRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: d.name ?? '',
        slug: d.slug ?? id,
        version: d.version ?? '1.0.0',
        description: d.description ?? '',
        type: d.type ?? '',
        isActive: d.isActive ?? false,
        components: d.components ?? [],
        settings: d.settings ?? {},
        dependencies: Array.isArray(d.dependencies) ? d.dependencies : [],
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migrateSlider(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.sliderRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        title: d.title ?? '',
        subtitle: d.subtitle ?? '',
        description: d.description ?? '',
        buttonText: d.buttonText ?? '',
        buttonLink: d.buttonLink ?? '',
        badge: d.badge ?? '',
        imageType: d.imageType ?? 'upload',
        imageUrl: d.imageUrl ?? '',
        isActive: d.isActive ?? true,
        order: Number(d.order) || 0,
        duration: Number(d.duration) || 5000,
        createdBy: d.createdBy ?? '',
        updatedBy: d.updatedBy ?? '',
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migrateVideo(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.videoRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        videoId: d.videoId ?? id,
        title: d.title ?? '',
        description: d.description ?? '',
        thumbnail: d.thumbnail ?? '',
        publishedAt: d.publishedAt ? new Date(d.publishedAt) : null,
        type: d.type ?? 'normal',
        status: d.status ?? 'visible',
        tags: Array.isArray(d.tags) ? d.tags : [],
        channelId: d.channelId ?? '',
        channelName: d.channelName ?? '',
        channelUrl: d.channelUrl ?? '',
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migrateModel3D(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.model3DRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: d.name ?? '',
        description: d.description ?? '',
        fileUrl: d.fileUrl ?? '',
        thumbnail: d.thumbnail ?? '',
        filetype: d.filetype ?? '',
        fileSize: Number(d.fileSize) || 0,
        isPublic: d.isPublic ?? true,
        createdAt,
        updatedAt,
      },
    });
  }
}

// ── Phase 3: Core Content ───────────────────────────────────────────

async function migrateNews(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.newsRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        title: d.title ?? '',
        slug: d.slug ?? id,
        excerpt: d.excerpt ?? '',
        content: d.content ?? '',
        featuredImage: typeof d.featuredImage === 'string' ? d.featuredImage : (d.featuredImage?.url ?? ''),
        author: d.author ?? '',
        isActive: d.isActive ?? true,
        category: d.category ?? '',
        tags: Array.isArray(d.tags) ? d.tags : [],
        translations: d.translations ?? null,
        seoTitle: d.seoMetaTitle ?? d.seoTitle ?? '',
        seoDescription: d.seoMetaDescription ?? d.seoDescription ?? '',
        seoKeywords: Array.isArray(d.seoKeywords) ? d.seoKeywords : [],
        views: Number(d.views) || 0,
        publishedAt: d.publishedAt ? new Date(d.publishedAt) : null,
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migratePortfolio(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.portfolioRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        title: d.title ?? '',
        slug: d.slug ?? id,
        description: d.description ?? '',
        content: d.content ?? '',
        coverImage: d.coverImage ?? '',
        images: Array.isArray(d.images) ? d.images : [],
        technologies: Array.isArray(d.technologies) ? d.technologies : [],
        category: d.category ?? '',
        isActive: d.isActive ?? true,
        featured: d.featured ?? false,
        externalUrl: d.externalUrl ?? '',
        translations: d.translations ?? null,
        createdAt,
        updatedAt,
      },
    });
  }
}

async function migrateService(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.serviceRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        title: d.title ?? '',
        description: d.description ?? '',
        features: Array.isArray(d.features) ? d.features : [],
        image: d.image ?? '',
        icon: d.icon ?? '',
        slug: d.slug ?? id,
        isActive: d.isActive ?? true,
        order: Number(d.order) || 0,
        translations: d.translations ?? null,
        createdAt,
        updatedAt,
      },
    });
  }
}

// ── Phase 4: E-commerce ─────────────────────────────────────────────

async function migrateProductCategory(docs) {
  // First pass: create without parent
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.productCategoryRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: d.name ?? '',
        slug: d.slug ?? id,
        description: d.description ?? '',
        order: Number(d.order) || 0,
        isActive: d.isActive ?? true,
        createdAt,
        updatedAt,
      },
    });
  }
  // Second pass: set parentId
  for (const doc of docs) {
    const { d, id } = extract(doc);
    if (d.parent) {
      try {
        await prisma.productCategoryRow.update({
          where: { id },
          data: { parentId: String(d.parent) },
        });
      } catch {
        console.warn(`  ⚠ Could not set parent for ProductCategory ${id} → ${d.parent}`);
      }
    }
  }
}

async function migrateProduct(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.productRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        title: d.title ?? '',
        slug: d.slug ?? id,
        description: d.description ?? '',
        condition: d.condition ?? 'new',
        price: d.price != null ? Number(d.price) : null,
        currency: d.currency ?? 'TRY',
        coverImage: d.coverImage ?? '',
        images: Array.isArray(d.images) ? d.images : [],
        attachments: d.attachments ?? [],
        stock: Number(d.stock) || 0,
        colors: Array.isArray(d.colors) ? d.colors : [],
        sizes: Array.isArray(d.sizes) ? d.sizes : [],
        attributes: d.attributes ?? [],
        ratingAverage: Number(d.ratingAverage) || 0,
        ratingCount: Number(d.ratingCount) || 0,
        isActive: d.isActive ?? true,
        translations: d.translations ?? null,
        createdAt,
        updatedAt,
      },
    });

    // Create join entries for categoryIds
    const categoryIds = Array.isArray(d.categoryIds) ? d.categoryIds : [];
    for (const catId of categoryIds) {
      try {
        await prisma.productToCategoryRow.upsert({
          where: { productId_categoryId: { productId: id, categoryId: String(catId) } },
          update: {},
          create: { productId: id, categoryId: String(catId) },
        });
      } catch {
        console.warn(`  ⚠ Could not link Product ${id} → Category ${catId}`);
      }
    }
  }
}

async function migrateProductReview(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    try {
      await prisma.productReviewRow.upsert({
        where: { id },
        update: {},
        create: {
          id,
          productId: String(d.productId ?? ''),
          userId: String(d.userId ?? ''),
          title: d.title ?? '',
          comment: d.comment ?? '',
          rating: Number(d.rating) || 3,
          status: d.status ?? 'pending',
          helpful: Number(d.helpful) || 0,
          createdAt,
          updatedAt,
        },
      });
    } catch {
      console.warn(`  ⚠ Could not migrate ProductReview ${id} (missing FK?)`);
    }
  }
}

async function migrateOrder(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    try {
      await prisma.orderRow.upsert({
        where: { id },
        update: {},
        create: {
          id,
          productId: String(d.product ?? d.productId ?? ''),
          productName: d.productName ?? '',
          productSlug: d.productSlug ?? '',
          customerName: d.customerName ?? '',
          customerEmail: d.customerEmail ?? '',
          customerPhone: d.customerPhone ?? '',
          customerAddress: d.customerAddress ?? '',
          note: d.note ?? '',
          quantity: Number(d.quantity) || 1,
          price: Number(d.price) || 0,
          selectedOptions: d.selectedOptions ?? [],
          status: d.status ?? 'new',
          deletedAt: d.deletedAt ? new Date(d.deletedAt) : null,
          createdAt,
          updatedAt,
        },
      });
    } catch {
      console.warn(`  ⚠ Could not migrate Order ${id} (missing FK?)`);
    }
  }
}

async function migrateCart(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    try {
      await prisma.cartRow.upsert({
        where: { id },
        update: {},
        create: {
          id,
          userId: String(d.userId ?? ''),
          items: d.items ?? [],
          total: Number(d.total) || 0,
          currency: d.currency ?? 'TRY',
          createdAt,
          updatedAt,
        },
      });
    } catch {
      console.warn(`  ⚠ Could not migrate Cart ${id} (missing FK?)`);
    }
  }
}

async function migrateMessage(docs) {
  for (const doc of docs) {
    const { d, id, createdAt, updatedAt } = extract(doc);
    await prisma.messageRow.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: d.name ?? '',
        email: d.email ?? '',
        subject: d.subject ?? '',
        message: d.message ?? '',
        status: d.status ?? 'unread',
        type: d.type ?? 'contact',
        productId: d.productId ?? null,
        productName: d.productName ?? '',
        orderId: d.orderId ?? null,
        conversation: d.conversation ?? [],
        adminReply: d.adminReply ?? '',
        createdAt,
        updatedAt,
      },
    });
  }
}

// ── Main ────────────────────────────────────────────────────────────

const MODEL_MIGRATORS = {
  // Phase 1
  SiteSettings: migrateSiteSettings,
  FooterSettings: migrateFooterSettings,
  Settings: migrateSettings,
  ContentSettings: migrateContentSettings,
  PageSetting: migratePageSetting,
  PageSettings: migratePageSettings,
  PageTemplate: migratePageTemplate,
  Language: migrateLanguage,
  About: migrateAbout,
  // Phase 2
  User: migrateUser,
  Category: migrateCategory,
  Contact: migrateContact,
  Theme: migrateTheme,
  Plugin: migratePlugin,
  Slider: migrateSlider,
  Video: migrateVideo,
  Model3D: migrateModel3D,
  // Phase 3
  News: migrateNews,
  Portfolio: migratePortfolio,
  Service: migrateService,
  // Phase 4 (order matters: categories before products)
  ProductCategory: migrateProductCategory,
  Product: migrateProduct,
  ProductReview: migrateProductReview,
  Order: migrateOrder,
  Cart: migrateCart,
  Message: migrateMessage,
};

async function main() {
  console.log('Starting migration from Document table to relational tables...\n');

  // Load all documents grouped by model
  const allDocs = await prisma.document.findMany({ orderBy: { createdAt: 'asc' } });
  const grouped = {};
  for (const doc of allDocs) {
    if (!grouped[doc.model]) grouped[doc.model] = [];
    grouped[doc.model].push(doc);
  }

  console.log(`Found ${allDocs.length} documents across ${Object.keys(grouped).length} models:\n`);
  for (const [model, docs] of Object.entries(grouped)) {
    console.log(`  ${model}: ${docs.length} documents`);
  }
  console.log();

  // Run migrators
  for (const [model, migrator] of Object.entries(MODEL_MIGRATORS)) {
    const docs = grouped[model] || [];
    if (docs.length === 0) {
      console.log(`  ⏭ ${model}: no documents, skipping`);
      continue;
    }
    try {
      await migrator(docs);
      console.log(`  ✅ ${model}: ${docs.length} documents migrated`);
    } catch (err) {
      console.error(`  ❌ ${model}: migration failed:`, err.message);
    }
  }

  // Report any unmapped models
  const mapped = new Set(Object.keys(MODEL_MIGRATORS));
  for (const model of Object.keys(grouped)) {
    if (!mapped.has(model)) {
      console.warn(`  ⚠ ${model}: ${grouped[model].length} documents (no migrator defined)`);
    }
  }

  console.log('\nMigration complete!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('Migration failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
