import { createPrismaModel } from '@/lib/prisma-model-adapter';
import { prisma } from '@/lib/prisma';

export default createPrismaModel('PageSetting', prisma.pageSettingRow);
