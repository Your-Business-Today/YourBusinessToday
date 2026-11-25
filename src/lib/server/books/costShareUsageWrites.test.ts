import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { recordCostShareUsage } from './costShareUsageWrites';

type Row = Record<string, unknown>;
const organisationId = '00000000-0000-4000-8000-0000000000a1';
const costCentreId = '00000000-0000-4000-8000-00000000c001';
const Projects = { ybt: '00000000-0000-4000-8000-00000000b001', carp: '00000000-0000-4000-8000-00000000b002' };
const vercelShare = { id: 'share-vercel', cost_centre_id: costCentreId, months_covered: 1, members_by: 'named', split_by: 'usage' };

function booksClosedTo(closedToMonth: string | null) {
	const changes: Row[] = [];
	const answers = new Map<string, unknown>([
		['books_cost_shares', vercelShare],
		['books_month_closes', closedToMonth === null ? null : { closed_to_month: closedToMonth, closed_by_name: 'James', closed_at: '' }],
		['projects', [{ id: Projects.ybt }, { id: Projects.carp }]],
		['books_cost_share_usage', null]
	]);
	const from = (table: string) => {
		const chain = {
			select: () => chain,
			eq: () => chain,
			in: () => chain,
			order: () => chain,
			limit: () => chain,
			maybeSingle: () => chain,
			delete: () => (changes.push({ delete: table }), chain),
			insert: (rows: Row[]) => (changes.push({ insert: rows }), chain),
			then: (resolve: (value: unknown) => unknown) => resolve({ data: answers.get(table), error: null })
		};
		return chain;
	};
	return { supabase: { from } as unknown as SupabaseClient, changes };
}

const readings = [
	{ projectId: Projects.ybt, usage: 12.03 },
	{ projectId: Projects.carp, usage: 1.55 }
];

describe('recordCostShareUsage', () => {
	it("keeps the month's readings in place of those kept before", async () => {
		const books = booksClosedTo(null);
		await recordCostShareUsage(books.supabase, organisationId, { costCentreId, month: '2026-11', readings });
		expect(books.changes).toEqual([
			{ delete: 'books_cost_share_usage' },
			{ insert: readings.map(({ projectId, usage }) => expect.objectContaining({ project_id: projectId, usage, month: '2026-11-01' })) }
		]);
	});

	it('refuses a month the books have closed, writing nothing', async () => {
		const books = booksClosedTo('2026-11-01');
		await expect(recordCostShareUsage(books.supabase, organisationId, { costCentreId, month: '2026-11', readings })).rejects.toThrow('closed');
		expect(books.changes).toEqual([]);
	});

	it('refuses a reading below nothing, and a project read twice', async () => {
		const books = booksClosedTo(null);
		const below = [{ projectId: Projects.ybt, usage: -1 }];
		await expect(recordCostShareUsage(books.supabase, organisationId, { costCentreId, month: '2026-11', readings: below })).rejects.toThrow('usage is a number');
		const twice = [readings[0], readings[0]];
		await expect(recordCostShareUsage(books.supabase, organisationId, { costCentreId, month: '2026-11', readings: twice })).rejects.toThrow('more than once');
	});
});
