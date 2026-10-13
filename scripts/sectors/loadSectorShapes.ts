import { createClient } from '@supabase/supabase-js';
import { loadSectorShapes } from '$lib/server/sectors/loadSectorShapes';

/**
 * Draws every postcode sector in Great Britain as a shape: the ground nearer its Code-Point Open centroid than any other
 * sector's, cut at the coast of the Boundary-Line country layer, written to postcode_sectors.boundary.
 *
 *   PUBLIC_SUPABASE_URL=… SUPABASE_SECRET_KEY=… node scripts/sectors/load-sector-shapes.mjs <codepo_gb.zip> <bdline_gb.gpkg>
 *
 * Code-Point Open (CSV) and Boundary-Line (GeoPackage, unzipped) are free downloads from the OS Data Hub;
 * run it each quarter when Code-Point Open is released. It writes each sector's centroid as well, so it stands on its own.
 */
const { argv, env } = process;
const [codePointZipPath, boundaryLinePath] = argv.slice(2);
const supabaseUrl = env.PUBLIC_SUPABASE_URL ?? '';
const secretKey = env.SUPABASE_SECRET_KEY ?? '';

if (codePointZipPath === undefined || boundaryLinePath === undefined || supabaseUrl === '' || secretKey === '') {
	console.error('Usage: PUBLIC_SUPABASE_URL=… SUPABASE_SECRET_KEY=… node scripts/sectors/load-sector-shapes.mjs <codepo_gb.zip> <bdline_gb.gpkg>');
	process.exit(1);
}

const supabase = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });
const summary = await loadSectorShapes(supabase, { codePointZipPath, boundaryLinePath });
console.log(`${summary.shaped} of ${summary.sectors} sectors drawn as shapes`);
