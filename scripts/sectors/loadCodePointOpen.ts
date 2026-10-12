import { createClient } from '@supabase/supabase-js';
import { loadCodePointOpen } from '$lib/server/sectors/loadCodePointOpen';

/**
 * Loads every postcode sector in Great Britain from the OS Code-Point Open zip.
 *
 *   PUBLIC_SUPABASE_URL=… SUPABASE_SECRET_KEY=… node scripts/sectors/load-code-point-open.mjs codepo_gb.zip
 *
 * Code-Point Open is a free download from the OS Data Hub, refreshed each quarter.
 */
const { argv, env } = process;
const [zipPath] = argv.slice(2);
const supabaseUrl = env.PUBLIC_SUPABASE_URL ?? '';
const secretKey = env.SUPABASE_SECRET_KEY ?? '';

if (zipPath === undefined || supabaseUrl === '' || secretKey === '') {
	console.error('Usage: PUBLIC_SUPABASE_URL=… SUPABASE_SECRET_KEY=… node scripts/sectors/load-code-point-open.mjs <codepo_gb.zip>');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });
const summary = await loadCodePointOpen(supabase, zipPath);
console.log(`${summary.sectors} sectors written from ${summary.unitPostcodes} unit postcodes`);
