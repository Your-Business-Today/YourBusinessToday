import { createClient } from '@supabase/supabase-js';
import { listPatches } from '$lib/server/patches/listPatches';
import { loadBuildingsForPatch } from '$lib/server/buildings/loadBuildings';

/**
 * Loads the building footprints and addressable places of every patch, or one patch by name.
 *
 *   PUBLIC_SUPABASE_URL=… SUPABASE_SECRET_KEY=… node scripts/buildings/load-buildings.mjs <opmplc.gpkg> <osopenuprn.zip> <codepo_gb.zip> <release> [patch name]
 *
 * OS OpenMap Local (GeoPackage), OS Open UPRN (CSV zip) and Code-Point Open are free downloads from the OS Data Hub;
 * the release is the words on the download, such as 2026-10, and is kept on every row written.
 */
const { argv, env } = process;
const [geoPackagePath, uprnZipPath, codePointZipPath, release, patchName] = argv.slice(2);
const supabaseUrl = env.PUBLIC_SUPABASE_URL ?? '';
const secretKey = env.SUPABASE_SECRET_KEY ?? '';

if (geoPackagePath === undefined || uprnZipPath === undefined || codePointZipPath === undefined || release === undefined || supabaseUrl === '' || secretKey === '') {
	console.error('Usage: PUBLIC_SUPABASE_URL=… SUPABASE_SECRET_KEY=… node scripts/buildings/load-buildings.mjs <opmplc.gpkg> <osopenuprn.zip> <codepo_gb.zip> <release> [patch name]');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });
const patches = (await listPatches(supabase)).filter((patch) => patchName === undefined || patch.name === patchName);
for (const patch of patches) {
	const summary = await loadBuildingsForPatch(supabase, patch, { geoPackagePath, uprnZipPath, codePointZipPath, release });
	console.log(`${patch.name}: ${summary.footprints} footprints, ${summary.addressablePlaces} addressable places, ${summary.placesInBuildings} inside a footprint`);
}
