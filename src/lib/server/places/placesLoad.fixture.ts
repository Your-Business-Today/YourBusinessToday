import type { Patch } from '$lib/server/patches/patchRecord';
import type { PlaceSeed } from '$lib/data/placeRules';
import type { PlacesLoad } from './placesWriter';

/** One batch a load handed the writer: the ids in it, and whether it was written as the territory's first load. */
export type BatchWritten = { ids: string[]; isFirstLoad: boolean };

/** The time as a load under test sees it, and how long the stand-in writer takes over a batch. */
export const clock = { now: 0, millisecondsPerBatch: 1_000 };

/** Every batch the stand-in writer was handed, in the order it came. */
export const batches: BatchWritten[] = [];

export const surbiton = { id: 'surbiton-id', name: 'Surbiton', centrePostcode: 'KT6 5PZ', radiusMiles: 3, outcodes: ['KT6'] } as unknown as Patch;

const placeOf = (sourceId: string): PlaceSeed => ({ sourceId, businessName: sourceId, category: '', address: '', postcode: 'KT6 5NF', latitude: 51.39, longitude: -0.3, website: '', phone: '', confidence: 0.9, sourceLicence: '' });

/** Five places of Surbiton as a release lists them, out of the order of their ids. */
export const fivePlaces = ['e', 'a', 'd', 'b', 'c'].map(placeOf);

export const asFirstLoad = (...ids: string[]): BatchWritten => ({ ids, isFirstLoad: true });

/** A writer that keeps what it was handed and takes its time over it, in place of the database. */
export async function writeBatch(_supabase: unknown, batch: PlaceSeed[], load: PlacesLoad): Promise<number> {
	batches.push({ ids: batch.map((place) => place.sourceId), isFirstLoad: load.isFirstLoad });
	clock.now += clock.millisecondsPerBatch;
	return batch.length;
}

export function startPlacesLoadAfresh(): void {
	batches.length = 0;
	clock.now = 0;
	clock.millisecondsPerBatch = 1_000;
}
