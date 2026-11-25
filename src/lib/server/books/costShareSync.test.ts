import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { BooksRefusal } from './booksRefusal';
import { syncCostShareMembers } from './costShareSync';

type Row = Record<string, unknown>;

const Tables = { shares: 'books_cost_shares', projects: 'projects' } as const;

const organisationId = '00000000-0000-4000-8000-0000000000a1';
const costCentreId = '00000000-0000-4000-8000-00000000c001';
const Projects = {
	ybt: '00000000-0000-4000-8000-00000000b001',
	carpMania: '00000000-0000-4000-8000-00000000b002',
	prentice: '00000000-0000-4000-8000-00000000b003'
};
const vercelShare = { id: 'share-vercel', cost_centre_id: costCentreId, months_covered: 1 };
const spells: Row[] = [
	{ id: 'm-ybt', cost_share_id: vercelShare.id, project_id: Projects.ybt, joined_month: '2026-01-01', left_month: null },
	{ id: 'm-prentice', cost_share_id: vercelShare.id, project_id: Projects.prentice, joined_month: '2026-03-01', left_month: null }
];

function booksWith() {
	const changes: Row[] = [];
	const answerFor = (table: string, value: unknown): unknown => {
		const answers = new Map<string, unknown>([
			[Tables.shares, vercelShare],
			[Tables.projects, { id: value, name: `Project ${value}`, organisation_id: organisationId }]
		]);
		return answers.get(table) ?? spells;
	};
	const database = {
		from: (table: string) => {
			let data: unknown = answerFor(table, null);
			const chain = {
				select: () => chain,
				eq: (column: string, value: unknown) => {
					const isProjectLookup = table === Tables.projects && column === 'id';
					if (isProjectLookup) data = answerFor(table, value);
					return chain;
				},
				update: (row: Row) => (changes.push({ update: row }), chain),
				delete: () => (changes.push({ delete: true }), chain),
				insert: (row: Row) => (changes.push({ insert: row }), chain),
				maybeSingle: () => chain,
				then: (resolve: (value: unknown) => unknown) => resolve({ data, error: null })
			};
			return chain;
		}
	};
	return { supabase: database as unknown as SupabaseClient, changes };
}

describe('syncCostShareMembers', () => {
	it('stops a project no longer live the month before, and starts a new one in the month', async () => {
		const books = booksWith();
		const request = { costCentreId, month: '2026-12', projectIds: [Projects.ybt, Projects.carpMania] };
		const result = await syncCostShareMembers(books.supabase, organisationId, request);
		const { plan } = result;
		expect(plan.joining).toEqual([Projects.carpMania]);
		expect(plan.leaving.map((spell) => spell.leftMonth)).toEqual(['2026-11']);
		expect(books.changes).toEqual([
			{ update: expect.objectContaining({ left_month: '2026-11-01' }) },
			{ insert: { organisation_id: organisationId, cost_share_id: vercelShare.id, project_id: Projects.carpMania, joined_month: '2026-12-01' } }
		]);
	});

	it('refuses a list that is not a list of project ids, changing nothing', async () => {
		const books = booksWith();
		const request = { costCentreId, month: '2026-12', projectIds: 'carp-mania' };
		await expect(syncCostShareMembers(books.supabase, organisationId, request)).rejects.toBeInstanceOf(BooksRefusal);
		expect(books.changes).toEqual([]);
	});
});
