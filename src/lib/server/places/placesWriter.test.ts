import { beforeEach, describe, expect, it, vi } from 'vitest';
import { markPlacesGone, upsertPlaceBatch } from './placesWriter';
import type { PlaceSeed } from '$lib/data/placeRules';
import type { SupabaseClient } from '@supabase/supabase-js';

type Asked = { door: string; sent: Record<string, unknown> };

const answers = vi.fn();
const asked: Asked[] = [];
const rpc = async (door: string, sent: Record<string, unknown>) => (asked.push({ door, sent }), answers());
const supabase = { rpc } as unknown as SupabaseClient;
const seenAt = '2026-11-16T02:50:00.000Z';
const firstLoad = { release: '2026-10-21.0', seenAt, isFirstLoad: true };

const lamb: PlaceSeed = {
	sourceId: 'lamb',
	businessName: 'The Lamb',
	category: 'pub',
	address: '73 Brighton Road',
	postcode: 'KT6 5NF',
	latitude: 51.3925,
	longitude: -0.3045,
	website: 'https://thelamb.example/',
	phone: '+442083990000',
	confidence: 0.95,
	sourceLicence: 'CDLA-Permissive-2.0'
};

describe('writing trading places', () => {
	beforeEach(() => {
		asked.length = 0;
		answers.mockReset();
		answers.mockResolvedValue({ data: 1, error: null });
	});

	it('writes a batch through the one door, with its release, when it was seen and whether the territory held none before', async () => {
		expect(await upsertPlaceBatch(supabase, [lamb], firstLoad)).toBe(1);
		expect(asked).toEqual([{ door: 'upsert_places', sent: expect.objectContaining({ seen_at: seenAt, is_first_load: true }) }]);
	});

	it('says a later load is not the first, so a place that is new is announced', async () => {
		await upsertPlaceBatch(supabase, [lamb], { ...firstLoad, isFirstLoad: false });
		expect(asked).toEqual([{ door: 'upsert_places', sent: expect.objectContaining({ is_first_load: false }) }]);
	});

	it('writes each place under the sector and outcode of its postcode, with its page on Overture as where it was read', async () => {
		await upsertPlaceBatch(supabase, [lamb], firstLoad);
		const [{ sent }] = asked;
		expect(sent.rows).toEqual([
			{
				source_id: 'lamb',
				business_name: 'The Lamb',
				category: 'pub',
				address: '73 Brighton Road',
				postcode: 'KT6 5NF',
				sector: 'KT6 5',
				outcode: 'KT6',
				latitude: 51.3925,
				longitude: -0.3045,
				website: 'https://thelamb.example/',
				phone: '+442083990000',
				confidence: 0.95,
				release: '2026-10-21.0',
				source_licence: 'CDLA-Permissive-2.0',
				source_url: 'https://explore.overturemaps.org/#lamb'
			}
		]);
	});

	it('stops at what the database refuses', async () => {
		answers.mockResolvedValue({ data: null, error: new Error('Only the service role writes places') });
		await expect(upsertPlaceBatch(supabase, [lamb], firstLoad)).rejects.toThrow('Only the service role writes places');
	});

	it('marks places gone a thousand ids at a time, and adds up how many of them were held', async () => {
		answers.mockResolvedValueOnce({ data: 40, error: null }).mockResolvedValueOnce({ data: 2, error: null });
		const goneIds = Array.from({ length: 1500 }, (_, index) => `gone-${index}`);
		expect(await markPlacesGone(supabase, goneIds, seenAt)).toBe(42);
		expect(asked).toEqual([
			{ door: 'mark_places_gone', sent: { gone_ids: goneIds.slice(0, 1000), seen_at: seenAt } },
			{ door: 'mark_places_gone', sent: { gone_ids: goneIds.slice(1000), seen_at: seenAt } }
		]);
	});

	it('asks the database nothing when no place has gone', async () => {
		expect(await markPlacesGone(supabase, [], seenAt)).toBe(0);
		expect(asked).toEqual([]);
	});
});
