import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { BooksRefusal } from './booksRefusal';
import { setCostCentreProject } from './costCentreProjects';

type Row = Record<string, unknown>;

const organisationId = '00000000-0000-4000-8000-0000000000a1';
const costCentreId = '00000000-0000-4000-8000-00000000c001';
const carpManiaId = '00000000-0000-4000-8000-00000000b001';
const salesLead = { id: costCentreId, name: 'Sales lead', is_archived: false };

function booksWith(project: Row | null, updateFailure: Row | null = null) {
	const updates: Row[] = [];
	const database = {
		from: (table: string) => {
			const isProjects = table === 'projects';
			let answer = { data: isProjects ? project : salesLead, error: null as Row | null };
			const chain = {
				select: () => chain,
				eq: () => chain,
				update: (row: Row) => {
					updates.push(row);
					answer = { data: updateFailure === null ? salesLead : null, error: updateFailure };
					return chain;
				},
				maybeSingle: () => chain,
				then: (resolve: (value: unknown) => unknown) => resolve(answer)
			};
			return chain;
		}
	};
	return { supabase: database as unknown as SupabaseClient, updates };
}

describe('setCostCentreProject', () => {
	it("keeps the cost centre for one of the organisation's own projects", async () => {
		const books = booksWith({ id: carpManiaId, name: 'Carp Mania', organisation_id: organisationId });
		const costCentre = await setCostCentreProject(books.supabase, organisationId, costCentreId, carpManiaId);
		expect(costCentre.name).toBe('Sales lead');
		expect(books.updates).toEqual([{ project_id: carpManiaId }]);
	});

	it('keeps it for no project when none is given', async () => {
		const books = booksWith(null);
		await setCostCentreProject(books.supabase, organisationId, costCentreId, '');
		expect(books.updates).toEqual([{ project_id: null }]);
	});

	it("refuses another organisation's project, writing nothing", async () => {
		const books = booksWith({ id: carpManiaId, name: 'Carp Mania', organisation_id: '00000000-0000-4000-8000-0000000000a2' });
		await expect(setCostCentreProject(books.supabase, organisationId, costCentreId, carpManiaId)).rejects.toThrow(
			"Project Carp Mania is not one of this organisation's own"
		);
		expect(books.updates).toEqual([]);
	});

	it('refuses a project id that is not an id, and a project that cannot be found', async () => {
		const books = booksWith(null);
		await expect(setCostCentreProject(books.supabase, organisationId, costCentreId, 'Carp Mania')).rejects.toBeInstanceOf(BooksRefusal);
		await expect(setCostCentreProject(books.supabase, organisationId, costCentreId, carpManiaId)).rejects.toThrow(/^No project/);
		expect(books.updates).toEqual([]);
	});

	it('refuses a second cost centre for a project that already has one', async () => {
		const books = booksWith({ id: carpManiaId, name: 'Carp Mania', organisation_id: organisationId }, { code: '23505' });
		await expect(setCostCentreProject(books.supabase, organisationId, costCentreId, carpManiaId)).rejects.toThrow(
			'Another cost centre is already kept for project Carp Mania'
		);
	});
});
