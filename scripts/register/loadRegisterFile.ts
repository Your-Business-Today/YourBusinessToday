import { createClient } from '@supabase/supabase-js';
import { loadRegisterFile, seenMonthOf } from '$lib/server/register/loadRegisterFile';

/**
 * Loads one Companies House monthly file into the register for every patch outcode.
 *
 *   PUBLIC_SUPABASE_URL=… SUPABASE_SECRET_KEY=… node scripts/register/load-register-file.mjs BasicCompanyDataAsOneFile-2026-10-01.zip
 *
 * The month is read from the file name; give it as a second argument when the file was renamed.
 */
const { argv, env } = process;
const [zipPath, givenMonth] = argv.slice(2);
const supabaseUrl = env.PUBLIC_SUPABASE_URL ?? '';
const secretKey = env.SUPABASE_SECRET_KEY ?? '';

if (zipPath === undefined || supabaseUrl === '' || secretKey === '') {
	console.error('Usage: PUBLIC_SUPABASE_URL=… SUPABASE_SECRET_KEY=… node scripts/register/load-register-file.mjs <zip> [YYYY-MM-01]');
	process.exit(1);
}

const seenMonth = givenMonth ?? seenMonthOf(zipPath);
if (seenMonth === null) {
	console.error('The month could not be read from the file name; give it as YYYY-MM-01 after the path.');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });
const summary = await loadRegisterFile(supabase, zipPath, seenMonth);
const outcodes = [...summary.countByOutcode.keys()].sort().join(' ');
console.log(`${summary.companiesWritten} companies loaded for ${outcodes} as at ${seenMonth}`);
console.log(`${summary.malformedRows} malformed rows skipped, ${summary.suppressedRows} suppressed companies skipped`);
