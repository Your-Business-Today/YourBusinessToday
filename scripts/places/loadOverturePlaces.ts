import { createClient } from '@supabase/supabase-js';
import { listPatches } from '$lib/server/patches/listPatches';
import { loadOverturePlacesForPatch } from '$lib/server/places/loadOverturePlaces';
import { openParquetReader } from '$lib/server/places/duckDb';

/**
 * Loads the trading places of every patch, or one patch by name, from one Overture Maps release.
 *
 *   PUBLIC_SUPABASE_URL=… SUPABASE_SECRET_KEY=… node scripts/places/load-overture-places.mjs <release, such as 2026-09-23.1> [patch name]
 *
 * The release name is the folder under s3://overturemaps-us-west-2/release/, printed on docs.overturemaps.org/release-calendar;
 * releases are kept for sixty days, their changelogs for good.
 */
const { argv, env } = process;
const [release, patchName] = argv.slice(2);
const supabaseUrl = env.PUBLIC_SUPABASE_URL ?? '';
const secretKey = env.SUPABASE_SECRET_KEY ?? '';

if (release === undefined || supabaseUrl === '' || secretKey === '') {
	console.error('Usage: PUBLIC_SUPABASE_URL=… SUPABASE_SECRET_KEY=… node scripts/places/load-overture-places.mjs <release> [patch name]');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });
const reader = await openParquetReader();
const patches = (await listPatches(supabase)).filter((patch) => patchName === undefined || patch.name === patchName);
for (const patch of patches) {
	const summary = await loadOverturePlacesForPatch(supabase, reader, patch, release);
	console.log(`${patch.name}: ${summary.written} places written, ${summary.refused} refused, ${summary.removed} removed`);
}
reader.close();
