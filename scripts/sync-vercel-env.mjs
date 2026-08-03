#!/usr/bin/env node
/**
 * Sync .env.local values to Vercel project environment variables.
 * Usage: node scripts/sync-vercel-env.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Parse .env.local
const raw = readFileSync(resolve(root, '.env.local'), 'utf-8');
const env = {};
for (const line of raw.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  env[key] = val;
}

// Keys to skip (dev-only or not needed on Vercel)
const SKIP = new Set(['NODE_ENV']);

// Keys that should only be set in Production (not Preview/Development)
const PROD_ONLY = new Set(['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'SEED_DEMO_DATA']);

// NEXTAUTH_URL override for production
const PROD_URL = 'https://fixral-cms.vercel.app';

async function run(cmd, input) {
  return new Promise((res) => {
    const child = spawn(cmd, { shell: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('close', (code) => res({ code, stdout, stderr }));
    if (input) child.stdin.write(input);
    child.stdin.end();
  });
}

async function main() {
  const entries = Object.entries(env).filter(([k]) => !SKIP.has(k));
  console.log(`\n🔄 Syncing ${entries.length} env vars to Vercel...\n`);

  for (const [key, value] of entries) {
    let finalValue = value;
    if (key === 'NEXTAUTH_URL') finalValue = PROD_URL;

    // Skip empty values (like YOUTUBE_API_KEY)
    if (!finalValue) {
      console.log(`  ⏭  ${key} (empty, skipping)`);
      continue;
    }

    const envs = PROD_ONLY.has(key) ? ['production'] : ['production', 'preview', 'development'];

    // Remove existing
    for (const e of envs) {
      await run(`npx vercel env rm ${key} ${e} --yes`);
    }

    // Add new — one environment at a time
    let allOk = true;
    for (const e of envs) {
      const { code, stderr } = await run(
        `npx vercel env add ${key} ${e}`,
        finalValue + '\n'
      );
      if (code !== 0) {
        console.log(`  ❌ ${key} [${e}] failed: ${stderr.trim()}`);
        allOk = false;
      }
    }
    if (allOk) {
      console.log(`  ✅ ${key} → [${envs.join(', ')}]`);
    }
  }

  console.log('\n✨ Done!\n');
}

main();
