import { describe, expect, it } from 'vitest';
import { BooksRefusal } from './booksRefusal';
import { addCostShareMember, setCostShareMemberLeaving } from './costShareMembers';
import { appleShare, booksWith, codManiaId, costCentreId, memberId, organisationId, spell } from './costShareMembers.fixtures';

describe('addCostShareMember', () => {
	it('adds the project from the month it joins, kept as the first of the month', async () => {
		const books = booksWith([]);
		const member = await addCostShareMember(books.supabase, organisationId, { costCentreId, projectId: codManiaId, joinedMonth: '2026-07' });
		expect(member.joinedMonth).toBe('2026-07');
		expect(books.writes).toEqual([
			{ organisation_id: organisationId, cost_share_id: appleShare.id, project_id: codManiaId, joined_month: '2026-07-01', left_month: null, weight: 1 }
		]);
	});

	it('refuses a spell that shares a month with one the project already has, writing nothing', async () => {
		const books = booksWith([spell(memberId, '2026-01-01', null)]);
		const request = { costCentreId, projectId: codManiaId, joinedMonth: '2026-07' };
		await expect(addCostShareMember(books.supabase, organisationId, request)).rejects.toBeInstanceOf(BooksRefusal);
		expect(books.writes).toEqual([]);
	});

	it('refuses a named member on a cost shared by every live project, writing nothing', async () => {
		const books = booksWith([], { ...appleShare, members_by: 'live_projects' });
		const request = { costCentreId, projectId: codManiaId, joinedMonth: '2026-07' };
		await expect(addCostShareMember(books.supabase, organisationId, request)).rejects.toThrow('every live project');
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
