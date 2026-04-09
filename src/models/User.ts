import { createPrismaModel } from '@/lib/prisma-model-adapter';
import { prisma } from '@/lib/prisma';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'user';
  isActive: boolean;
}

export default createPrismaModel('User', prisma.userRow);
