import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { csvRecordsInZip } from '$lib/server/csv/csvRecordsInZip';
import { footprintOf } from './buildingFootprint';
import { geocodePostcodes } from '$lib/server/postcodes/geocodePostcodes';
import { NearestPostcodeIndex } from './nearestPostcode';
import { patchGridBounds } from './patchGridBounds';
import { placeUprnsInBuildings, type PlacedBuilding } from './placeUprns';
import { readOpenMapBuildings, type GridBounds } from './openMapBuildings';
import { outcodeOf } from '$lib/data/postcode';
import { readUnitPostcodePoint, type UnitPostcodePoint } from '$lib/server/sectors/codePointRow';
import { readUprnPoint, type UprnPoint } from './uprnRows';
import { recordBuildingsRun, replacePatchBuildings, writePremisesPoints, type BuildingSeed } from './buildingsWriter';
import type { Patch } from '$lib/server/patches/patchRecord';

/** The three files the loader reads, by hand, each April and October. */
export type BuildingsFiles = { geoPackagePath: string; uprnZipPath: string; codePointZipPath: string; release: string };

export type BuildingsLoadSummary = { footprints: number; addressablePlaces: number; placesInBuildings: number };

/** Every footprint in the patch's circle, the places inside each, and the nearest postcode to each, written whole. */
export async function loadBuildingsForPatch(supabase: SupabaseClient, patch: Patch, files: BuildingsFiles): Promise<BuildingsLoadSummary> {
	const startedAt = new Date().toISOString();
	const located = await geocodePostcodes(supabase, [patch.centrePostcode]);
	const centre = located.get(patch.centrePostcode);
	if (centre === undefined) throw new Error(`${patch.name}: the centre postcode is not located`);
	const bounds = patchGridBounds(centre, patch.radiusMiles);
	const footprints = [...readOpenMapBuildings(files.geoPackagePath, bounds)].map(footprintOf);
	const points = await readUprnPoints(files.uprnZipPath, bounds);
	const postcodes = new NearestPostcodeIndex(await unitPostcodesIn(files.codePointZipPath, new Set(patch.outcodes)));
	const { buildings, outside } = placeUprnsInBuildings(footprints, points);
	const seeds = buildings.map((building) => seedOf(building, postcodes));
	await replacePatchBuildings(supabase, patch.id, seeds, files.release);
	await writePremisesPoints(supabase, points, buildingIdByUprn(seeds));
	await recordBuildingsRun(supabase, seeds.length, files.release, startedAt);
	return { footprints: seeds.length, addressablePlaces: points.length, placesInBuildings: points.length - outside.length };
}

function seedOf(building: PlacedBuilding, postcodes: NearestPostcodeIndex): BuildingSeed {
	const { footprint } = building;
	return { id: randomUUID(), building, nearest: postcodes.nearestTo(footprint.centre) };
}

async function readUprnPoints(zipPath: string, bounds: GridBounds): Promise<UprnPoint[]> {
	const points: UprnPoint[] = [];
	for await (const record of csvRecordsInZip(zipPath)) {
		const point = readUprnPoint(record, bounds);
		if (point !== null) points.push(point);
	}
	return points;
}

async function unitPostcodesIn(zipPath: string, outcodes: Set<string>): Promise<UnitPostcodePoint[]> {
	const points: UnitPostcodePoint[] = [];
	for await (const record of csvRecordsInZip(zipPath)) {
		const point = readUnitPostcodePoint(record);
		const isInPatch = point !== null && outcodes.has(outcodeOf(point.postcode));
		if (isInPatch) points.push(point);
	}
	return points;
}

function buildingIdByUprn(seeds: BuildingSeed[]): Map<number, string> {
	return new Map(seeds.flatMap((seed) => uprnsOf(seed).map((uprn) => [uprn, seed.id] as const)));
}

function uprnsOf(seed: BuildingSeed): number[] {
	const { building } = seed;
	return building.uprns;
}

