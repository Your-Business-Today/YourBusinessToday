import type { SupabaseClient } from '@supabase/supabase-js';

type Row = Record<string, unknown>;
type Ordering = { column: string; isAscending: boolean };

/** The most rows the stand-in hands back for one request, as the database does without a word. */
export const rowsHandedBackAtOnce = 1000;

/** One premises row as the table holds it: a café in Surbiton unless the facts given say otherwise. */
export function premisesRowOf(facts: Row = {}): Row {
	return {
		id: '11111111-1111-4111-8111-111111111111',
		source: 'food_hygiene',
		source_id: 'fsa-1',
		business_name: 'The Lamb',
		business_type: 'Pub/bar/nightclub',
		address: '73 Brighton Road, Surbiton',
		postcode: 'KT6 5NF',
		sector: 'KT6 5',
		outcode: 'KT6',
		latitude: 51.3925,
		longitude: -0.3045,
		rating_value: '5',
		rating_date: '2026-06-01',
		is_new_rating_pending: false,
		first_seen_at: '2026-10-26T02:00:00Z',
		last_seen_at: '2026-11-15T02:00:00Z',
		is_gone: false,
		source_url: 'https://ratings.food.gov.uk/business/1',
		client_id: null,
		category: '',
		website: '',
		phone: '',
		confidence: null,
		...facts
	};
}

/** A stand-in database whose premises table narrows, orders, pages and counts as the real one does, row cap and all. */
export function premisesTableOf(rows: Row[]): SupabaseClient {
	return { from: () => premisesQuery(rows) } as unknown as SupabaseClient;
}

function premisesQuery(held: Row[]) {
	const filters: ((row: Row) => boolean)[] = [];
	const orderings: Ordering[] = [];
	let firstRow = 0;
	let lastRow = rowsHandedBackAtOnce - 1;
	const keep = (filter: (row: Row) => boolean) => (filters.push(filter), chain);
	const chain = {
		select: () => chain,
		in: (column: string, values: unknown[]) => keep((row) => values.includes(row[column])),
		eq: (column: string, value: unknown) => keep((row) => row[column] === value),
		gte: (column: string, value: string | number) => keep((row) => row[column] !== null && (row[column] as string | number) >= value),
		lte: (column: string, value: string | number) => keep((row) => row[column] !== null && (row[column] as string | number) <= value),
		ilike: (column: string, pattern: string) => keep((row) => likePattern(pattern).test(String(row[column] ?? ''))),
		order: (column: string, options: { ascending: boolean } = { ascending: true }) => (orderings.push({ column, isAscending: options.ascending }), chain),
		range: (first: number, last: number) => ((firstRow = first), (lastRow = last), chain),
		limit: (count: number) => ((lastRow = firstRow + count - 1), chain),
		then: (resolve: (answer: { data: Row[]; error: null; count: number }) => unknown) => {
			const matched = [...held.filter((row) => filters.every((filter) => filter(row)))].sort(byEach(orderings));
			const lastHandedBack = Math.min(lastRow, firstRow + rowsHandedBackAtOnce - 1);
			return resolve({ data: matched.slice(firstRow, lastHandedBack + 1), error: null, count: matched.length });
		}
	};
	return chain;
}

function byEach(orderings: Ordering[]): (first: Row, second: Row) => number {
	return (first, second) => {
		for (const { column, isAscending } of orderings) {
			const difference = String(first[column]).localeCompare(String(second[column]));
			if (difference !== 0) return isAscending ? difference : -difference;
		}
		return 0;
	};
}

const wildcardsAsRegularExpression: Record<string, string> = { '%': '.*', _: '.' };

/** The pattern as the database reads it: % is anything, _ is any one character, and a backslash makes the next one plain. */
function likePattern(pattern: string): RegExp {
	const source = pattern.replace(/\\(.)|%|_|[.*+?^${}()|[\]]/g, (matched, escaped: string | undefined) => {
		if (escaped !== undefined) return plainInRegularExpression(escaped);
		return wildcardsAsRegularExpression[matched] ?? plainInRegularExpression(matched);
	});
	return new RegExp(`^${source}$`, 'i');
}

function plainInRegularExpression(character: string): string {
	return character.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
