import type { SupabaseClient } from '@supabase/supabase-js';
import { likePattern } from './premisesTable.fixture';

/** One row of patch_place_categories, as the database hands it back. */
export type CategoryRow = { category: string; place_count: number; with_phone_count: number };

/** A call the stand-in was asked to make: which function, for which territory, counted how. */
export type FunctionCall = { functionName: string; patchId: string; count: string | undefined };

type Ordering = { column: keyof CategoryRow; isAscending: boolean };
type Answer = { data: CategoryRow[] | null; error: { code: string } | null; count: number | null };

/** A stand-in database whose patch_place_categories hands back the rows given, narrowed, ordered, cut short and counted as the real answer is. */
export function placeCategoriesOf(rows: CategoryRow[], calls: FunctionCall[] = []): SupabaseClient {
	return standInAnswering((kept, orderings, mostRows) => ({ data: [...kept].sort(byEach(orderings)).slice(0, mostRows), error: null, count: kept.length }), rows, calls);
}

/** A stand-in database that fails every call to the function with the error given. */
export function placeCategoriesFailingWith(error: { code: string }): SupabaseClient {
	return standInAnswering(() => ({ data: null, error, count: null }), [], []);
}

function standInAnswering(answer: (kept: CategoryRow[], orderings: Ordering[], mostRows: number) => Answer, rows: CategoryRow[], calls: FunctionCall[]): SupabaseClient {
	const rpc = (functionName: string, given: { target_patch_id: string }, options: { count?: string } = {}) => {
		calls.push({ functionName, patchId: given.target_patch_id, count: options.count });
		return categoriesQuery(rows, answer);
	};
	return { rpc } as unknown as SupabaseClient;
}

function categoriesQuery(held: CategoryRow[], answer: (kept: CategoryRow[], orderings: Ordering[], mostRows: number) => Answer) {
	const orderings: Ordering[] = [];
	let kept = held;
	let mostRows = held.length;
	const chain = {
		ilike: (column: keyof CategoryRow, pattern: string) => ((kept = kept.filter((row) => likePattern(pattern).test(String(row[column])))), chain),
		order: (column: keyof CategoryRow, options: { ascending: boolean } = { ascending: true }) => (orderings.push({ column, isAscending: options.ascending }), chain),
		limit: (count: number) => ((mostRows = count), chain),
		then: (resolve: (answered: Answer) => unknown) => resolve(answer(kept, orderings, mostRows))
	};
	return chain;
}

function byEach(orderings: Ordering[]): (first: CategoryRow, second: CategoryRow) => number {
	return (first, second) => {
		for (const { column, isAscending } of orderings) {
			const difference = inOrder(first[column], second[column]);
			if (difference !== 0) return isAscending ? difference : -difference;
		}
		return 0;
	};
}

function inOrder(first: string | number, second: string | number): number {
	if (typeof first === 'number' && typeof second === 'number') return first - second;
	return String(first).localeCompare(String(second));
}
