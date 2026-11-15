import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { readNewestPatchMadeAt } from './readNewestPatchMadeAt';

type Failure = { code: string };
type Asked = { table: string; column: string; orderedBy: string; isAscending: boolean; mostRows: number };

const databaseDown: Failure = { code: '57P03' };
const sutton = '2026-10-25T09:00:00+00:00';
const surbiton = '2026-11-15T16:00:00+00:00';

function patchesMadeAt(madeAt: string[], failure: Failure | null = null) {
	const asked: Asked = { table: '', column: '', orderedBy: '', isAscending: true, mostRows: 0 };
	const rowsAsked = () => {
		const oldestFirst = [...madeAt].sort();
		const inOrder = asked.isAscending ? oldestFirst : oldestFirst.reverse();
		return inOrder.slice(0, asked.mostRows).map((created_at) => ({ created_at }));
	};
	const query = {
		select(column: string) {
			asked.column = column;
			return query;
		},
		order(column: string, { ascending }: { ascending: boolean }) {
			asked.orderedBy = column;
			asked.isAscending = ascending;
			return query;
		},
		async limit(mostRows: number) {
			asked.mostRows = mostRows;
			return failure === null ? { data: rowsAsked(), error: null } : { data: null, error: failure };
		}
	};
	const from = (table: string) => {
		asked.table = table;
		return query;
	};
	return { supabase: { from } as unknown as SupabaseClient, asked };
}

describe('reading when the newest patch was made', () => {
	it('answers the moment the newest was made, asking the patches for that one row', async () => {
		const { supabase, asked } = patchesMadeAt([sutton, surbiton]);
		expect(await readNewestPatchMadeAt(supabase)).toBe(surbiton);
		expect(asked).toEqual({ table: 'patches', column: 'created_at', orderedBy: 'created_at', isAscending: false, mostRows: 1 });
	});

	it('answers null while there is no patch', async () => {
		expect(await readNewestPatchMadeAt(patchesMadeAt([]).supabase)).toBeNull();
	});

	it('fails when the database fails, so a sweep is never chosen on a guess', async () => {
		await expect(readNewestPatchMadeAt(patchesMadeAt([sutton], databaseDown).supabase)).rejects.toEqual(databaseDown);
	});
});
