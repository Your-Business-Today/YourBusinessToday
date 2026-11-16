import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { getFeedForPatches } from './getFeedForPatches';
import { listEventsForCompany } from './listEventsForCompany';

type StoredLine = { id: string; outcode: string; kind: string; company_number: string; created_at: string; is_withdrawn: boolean };
type Row = Record<string, unknown>;
type Filter = (row: Row) => boolean;

const holdingCompany = '01490183';
const freshLine: StoredLine = {
	id: 'line-kept',
	outcode: 'KT6',
	kind: 'holding_company_over_trading',
	company_number: holdingCompany,
	created_at: '2026-11-16T09:00:00+00:00',
	is_withdrawn: false
};
const firstLoadLine: StoredLine = { ...freshLine, id: 'line-withdrawn', created_at: '2026-11-15T17:35:00+00:00', is_withdrawn: true };

function areaEventsHolding(lines: StoredLine[]) {
	const filtersAsked: string[] = [];
	const filters: Filter[] = [];
	const rowsMatching = () => lines.filter((line) => filters.every((matches) => matches(line)));
	const query = {
		select: () => query,
		in(column: string, values: unknown[]) {
			filters.push((row) => values.includes(row[column]));
			return query;
		},
		eq(column: string, value: unknown) {
			filtersAsked.push(`${column}=${String(value)}`);
			filters.push((row) => row[column] === value);
			return query;
		},
		gte: () => query,
		order: () => query,
		limit: async () => ({ data: rowsMatching(), error: null })
	};
	return { supabase: { from: () => query } as unknown as SupabaseClient, filtersAsked };
}

describe('lines withdrawn from the feed', () => {
	it('are left out of a territory feed, asked of the database before the newest hundred are counted', async () => {
		const { supabase, filtersAsked } = areaEventsHolding([freshLine, firstLoadLine]);
		const feed = await getFeedForPatches(supabase, { outcodes: ['KT6'], kinds: null, since: null });
		expect(feed.map((line) => line.id)).toEqual([freshLine.id]);
		expect(filtersAsked).toContain('is_withdrawn=false');
	});

	it('are left out of what the feed holds about one company', async () => {
		const { supabase, filtersAsked } = areaEventsHolding([freshLine, firstLoadLine]);
		const events = await listEventsForCompany(supabase, holdingCompany);
		expect(events.map((line) => line.id)).toEqual([freshLine.id]);
		expect(filtersAsked).toContain('is_withdrawn=false');
	});
});
