import type { SupabaseClient } from '@supabase/supabase-js';
import { drawSectorShapes } from './sectorShapes';
import { readGreatBritainLand } from './boundaryLineLand';
import { readSectorCentroids } from './codePointCentroids';
import { recordSectorsRun, upsertPostcodeSectors } from './sectorsWriter';
import { sectorBoundarySources } from '$lib/data/sectorBoundarySources';

/** The two files the shapes are drawn from, by hand, each quarter Code-Point Open is released. */
export type SectorShapesFiles = { codePointZipPath: string; boundaryLinePath: string };

export type SectorShapesLoadSummary = { sectors: number; shaped: number };

/** Every sector in Great Britain drawn as the ground nearer its centroid than any other's, cut at the coast, written over its circle. */
export async function loadSectorShapes(supabase: SupabaseClient, files: SectorShapesFiles): Promise<SectorShapesLoadSummary> {
	const startedAt = new Date().toISOString();
	const { centroids } = await readSectorCentroids(files.codePointZipPath);
	const land = [...readGreatBritainLand(files.boundaryLinePath)];
	const shapes = drawSectorShapes(centroids, land);
	await upsertPostcodeSectors(supabase, shapes);
	await recordSectorsRun(supabase, sectorBoundarySources.codePointVoronoi, shapes.length, startedAt);
	return { sectors: shapes.length, shaped: shapes.filter((shape) => shape.boundary !== null).length };
}
