import { createPrismaModel } from '@/lib/prisma-model-adapter';
import { prisma } from '@/lib/prisma';

export interface IServiceTranslation {
  title?: string;
  description?: string;
  excerpt?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface IService {
  _id: string;
  title: string;
  description: string;
  features?: string[];
  image: string;
  icon?: string;
  translations?: Map<string, IServiceTranslation>;
  createdAt: Date;
  updatedAt: Date;
}

export default createPrismaModel('Service', prisma.serviceRow);
