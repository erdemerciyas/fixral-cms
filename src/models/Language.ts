import { createPrismaModel } from '@/lib/prisma-model-adapter';
import { prisma } from '@/lib/prisma';

export interface ILanguage {
  _id: string;
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
  isDefault: boolean;
  isActive: boolean;
  direction: 'ltr' | 'rtl';
  createdAt: Date;
  updatedAt: Date;
}

export default createPrismaModel('Language', prisma.languageRow);
