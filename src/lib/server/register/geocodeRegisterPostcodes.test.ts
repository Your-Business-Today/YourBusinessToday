import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

const known = (postcode: string) => !postcode.startsWith('ZZ');
let stillToPlace: string[] = [];
const remembered: string[] = [];

vi.mock('$lib/server/postcodes/geocodePostcodes', () => ({
	geocodePostcodes: async (_supabase: unknown, postcodes: string[]) => {
		const located = postcodes.filter(known);
		stillToPlace = stillToPlace.filter((postcode) => !located.includes(postcode));
		return new Map(located.map((postcode) => [postcode, { postcode }]));
	}
}));
vi.mock('$lib/server/postcodes/postcodesNotFoundWriter', () => ({
	rememberPostcodesNotFound: async (_supabase: unknown, postcodes: string[]) => {
		remembered.push(...postcodes);
		stillToPlace = stillToPlace.filter((postcode) => !postcodes.includes(postcode));
	}
}));

const { geocodeRegisterPostcodes, geocodeRegisterPostcodesUntil } = await import('./geocodeRegisterPostcodes');

const countingFunction = 'count_register_postcodes_to_geocode';

/** A stand-in register that serves the postcodes still to place a page at a time, and counts them. */
const supabase = {
	rpc: async (name: string, input?: { page_size: number }) => {
		if (name === countingFunction) return { data: stillToPlace.length, error: null };
		return { data: stillToPlace.slice(0, input?.page_size).map((postcode) => ({ postcode })), error: null };
	}
} as unknown as SupabaseClient;

const postcodesNumbered = (count: number) => Array.from({ length: count }, (_, index) => `KT6 ${index}AA`);
const inAMinute = () => Date.now() + 60_000;

describe('placing register postcodes on the map', () => {
	beforeEach(() => {
		remembered.length = 0;
	});

	it('remembers the postcodes the postcode service does not know, so the next page does not serve them again', async () => {
		stillToPlace = ['ZZ1 1ZZ', 'KT6 5PZ', 'ZZ2 2ZZ', 'KT6 4AA'];
		expect(await geocodeRegisterPostcodes(supabase)).toEqual({ geocodedCount: 2, remainingCount: 0 });
		expect(remembered).toEqual(['ZZ1 1ZZ', 'ZZ2 2ZZ']);
	});

	it('works page after page until none remain, telling whoever keeps a record after each page', async () => {
		stillToPlace = postcodesNumbered(250);
		const pages: string[] = [];
		const progress = await geocodeRegisterPostcodesUntil(supabase, inAMinute(), async (page) => void pages.push(`${page.geocodedCount}:${page.remainingCount}`));
		expect(progress).toEqual({ geocodedCount: 250, remainingCount: 0 });
		expect(pages).toEqual(['100:150', '200:50', '250:0']);
	});

	it('stops after the page in hand once the moment has passed, saying how many remain', async () => {
		stillToPlace = postcodesNumbered(250);
		const alreadyPast = Date.now() - 1;
		expect(await geocodeRegisterPostcodesUntil(supabase, alreadyPast)).toEqual({ geocodedCount: 100, remainingCount: 150 });
	});

	it('never stalls behind a hundred postcodes nobody knows: they are remembered and the postcodes behind them placed', async () => {
		const unknown = Array.from({ length: 100 }, (_, index) => `ZZ${index} 1ZZ`);
		stillToPlace = [...unknown, 'KT6 5PZ'];
		expect(await geocodeRegisterPostcodesUntil(supabase, inAMinute())).toEqual({ geocodedCount: 1, remainingCount: 0 });
		expect(remembered).toHaveLength(100);
	});
});
