/**
 * Admin Authentication Middleware
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

/**
 * Check if user is authenticated as admin
 */
export async function isAdminAuthenticated(_request: NextRequest): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return false;
    }

    return (session.user as { role?: string }).role === 'admin';
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  let sanitized = input.trim();
  let prev;
  do {
    prev = sanitized;
    sanitized = sanitized
      .replace(/javascript\s*:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  } while (sanitized !== prev);

  return sanitized
    .replace(/[<>]/g, '')
    .slice(0, 1000);
}

/**
 * Get client IP for rate limiting
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  return forwarded?.split(',')[0] || realIp || 'unknown';
}
