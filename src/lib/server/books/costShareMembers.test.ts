import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { BooksRefusal } from './booksRefusal';
import { addCostShareMember, setCostShareMemberLeaving } from './costShareMembers';

type Row = Record<string, unknown>;

const organisationId = '00000000-0000-4000-8000-0000000000a1';
const costCentreId = '00000000-0000-4000-8000-00000000c001';
const codManiaId = '00000000-0000-4000-8000-00000000b002';
const memberId = '00000000-0000-4000-8000-00000000d001';
const appleShare = { id: 'share-apple', cost_centre_id: costCentreId, months_covered: 12 };
const codMania = { id: codManiaId, name: 'Cod Mania', organisation_id: organisationId };
const spell = (id: string, joined: string, left: string | null): Row => ({
	id,
	cost_share_id: appleShare.id,
	project_id: codManiaId,
	joined_month: joined,
	left_month: left
});

function booksWith(spells: Row[]) {
	const writes: Row[] = [];
	const database = {
		from: (table: string) => {
			let answer: { data: unknown; error: null } = { data: null, error: null };
			let isWriting = false;
			if (table === 'books_cost_shares') answer = { data: appleShare, error: null };
			if (table === 'projects') answer = { data: codMania, error: null };
			if (table === 'books_cost_share_members') answer = { data: spells, error: null };
			const chain = {
				select: () => chain,
				eq: (column: string, value: unknown) => {
					if (!isWriting && column === 'id' && table === 'books_cost_share_members')
						answer = { data: spells.find((row) => row.id === value) ?? null, error: null };
					return chain;
				},
				insert: (row: Row) => {
					writes.push(row);
					answer = { data: { id: 'new-member', ...row }, error: null };
					return chain;
				},
				update: (row: Row) => {
					writes.push(row);
					isWriting = true;
					answer = { data: { ...spells[0], ...row }, error: null };
					return chain;
				},
				single: () => chain,
				maybeSingle: () => chain,
				then: (resolve: (value: unknown) => unknown) => resolve(answer)
			};
			return chain;
		}
	};
	return { supabase: database as unknown as SupabaseClient, writes };
}

describe('addCostShareMember', () => {
	it('adds the project from the month it joins, kept as the first of the month', async () => {
		const books = booksWith([]);
		const member = await addCostShareMember(books.supabase, organisationId, { costCentreId, projectId: codManiaId, joinedMonth: '2026-07' });
		expect(member.joinedMonth).toBe('2026-07');
		expect(books.writes).toEqual([
			{ organisation_id: organisationId, cost_share_id: appleShare.id, project_id: codManiaId, joined_month: '2026-07-01', left_month: null }
		]);
	});

	it('refuses a spell that shares a month with one the project already has, writing nothing', async () => {
		const books = booksWith([spell(memberId, '2026-01-01', null)]);
		const request = { costCentreId, projectId: codManiaId, joinedMonth: '2026-07' };
		await expect(addCostShareMember(books.supabase, organisationId, request)).rejects.toBeInstanceOf(BooksRefusal);
		expect(books.writes).toEqual([]);
	});

	it('refuses a month that is not written as 2026-07', async () => {
		const books = booksWith([]);
		const request = { costCentreId, projectId: codManiaId, joinedMonth: 'July' };
		await expect(addCostShareMember(books.supabase, organisationId, request)).rejects.toThrow('joinedMonth');
	});
});

describe('setCostShareMemberLeaving', () => {
	it('sets the last month the project shares the cost', async () => {
		const books = booksWith([spell(memberId, '2026-07-01', null)]);
		const member = await setCostShareMemberLeaving(books.supabase, organisationId, memberId, '2026-09');
		expect(member.leftMonth).toBe('2026-09');
		expect(books.writes[0]).toMatchObject({ left_month: '2026-09-01' });
	});

	it('refuses carrying on into a later spell of the same project', async () => {
		const books = booksWith([spell(memberId, '2026-01-01', '2026-03-01'), spell('later-spell', '2026-06-01', null)]);
		await expect(setCostShareMemberLeaving(books.supabase, organisationId, memberId, '')).rejects.toBeInstanceOf(BooksRefusal);
	});
});
