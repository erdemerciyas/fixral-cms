/**
 * No-op: models are now backed by Prisma and don't need eager registration.
 * Kept for backward-compatibility so existing call-sites don't break.
 */
export async function ensureModels(..._modelNames: string[]) {
  // Prisma models are always available via the singleton client.
}
