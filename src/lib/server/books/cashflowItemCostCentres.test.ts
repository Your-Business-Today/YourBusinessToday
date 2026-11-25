import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { setCashflowItemCostCentre } from './cashflowItemCostCentres';

type Row = Record<string, unknown>;

const organisationId = '00000000-0000-4000-8000-0000000000a1';
const itemId = '00000000-0000-4000-8000-00000000d001';
const costCentreId = '00000000-0000-4000-8000-00000000c001';

function forecastWith(answer: { data: Row | null; error: Row | null }) {
	const updates: Row[] = [];
	const chain = {
		update: (row: Row) => {
			updates.push(row);
			return chain;
		},
		eq: () => chain,
		select: () => chain,
		maybeSingle: () => chain,
		then: (resolve: (value: unknown) => unknown) => resolve(answer)
	};
	return { supabase: { from: () => chain } as unknown as SupabaseClient, updates };
}

describe('setCashflowItemCostCentre', () => {
	it('keeps the item against the cost centre, and against none when none is given', async () => {
		const forecast = forecastWith({ data: { title: 'Azure for ConservAqua' }, error: null });
		expect(await setCashflowItemCostCentre(forecast.supabase, organisationId, itemId, costCentreId)).toBe('Azure for ConservAqua');
		await setCashflowItemCostCentre(forecast.supabase, organisationId, itemId, '');
		expect(forecast.updates.map((row) => row.cost_centre_id)).toEqual([costCentreId, null]);
	});

	it('refuses an id that is not one, writing nothing', async () => {
		const forecast = forecastWith({ data: null, error: null });
		await expect(setCashflowItemCostCentre(forecast.supabase, organisationId, itemId, 'ConservAqua')).rejects.toThrow(/cost centre must be an id/);
		expect(forecast.updates).toEqual([]);
	});

	it("refuses a cost centre that is not in the organisation's books, and an item that is not", async () => {
		const elsewhere = forecastWith({ data: null, error: { code: '23503' } });
		await expect(setCashflowItemCostCentre(elsewhere.supabase, organisationId, itemId, costCentreId)).rejects.toThrow(/^No cost centre/);
		const missing = forecastWith({ data: null, error: null });
		await expect(setCashflowItemCostCentre(missing.supabase, organisationId, itemId, costCentreId)).rejects.toThrow(/^No cashflow item/);
	});
});
