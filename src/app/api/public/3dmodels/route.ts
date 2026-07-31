import { NextResponse } from 'next/server';

import { logger } from '@/core/lib/logger';
import { asyncHandler } from '@/lib/errorHandler';

import Portfolio from '@/models/Portfolio';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface EmbeddedModel3D {
  _id?: string;
  publicId?: string;
  name?: string;
  url?: string;
  format?: string;
  size?: number;
  uploadedAt?: string | Date;
}

// GET /api/public/3dmodels - Portföylere gömülü 3D modelleri herkese açık listele
export const GET = asyncHandler(async (req: Request) => {
  const startTime = Date.now();
  logger.apiRequest('GET', '/api/public/3dmodels');

  const { searchParams } = new URL(req.url);
  const limitParam = parseInt(searchParams.get('limit') || '', 10);
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;

  const portfolios = await Portfolio.find({}).select('title models3D');

  const models = portfolios
    .flatMap((portfolio: { _id: string; title: string; models3D?: EmbeddedModel3D[] }) =>
      (Array.isArray(portfolio.models3D) ? portfolio.models3D : [])
        .filter((model) => Boolean(model?.url))
        .map((model) => ({
          _id: String(model._id || model.publicId || `${portfolio._id}-${model.url}`),
          name: model.name || 'Model',
          url: model.url as string,
          format: model.format || '',
          size: model.size || 0,
          uploadedAt: model.uploadedAt || null,
          portfolioTitle: portfolio.title,
        })),
    )
    .sort(
      (a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime(),
    );

  const result = limit ? models.slice(0, limit) : models;

  const duration = Date.now() - startTime;
  logger.apiResponse('GET', '/api/public/3dmodels', 200, duration);

  return NextResponse.json(result);
});
