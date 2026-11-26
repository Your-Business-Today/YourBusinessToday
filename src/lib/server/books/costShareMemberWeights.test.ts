import { describe, expect, it } from 'vitest';
import { setCostShareMemberWeight } from './costShareMemberWeights';
import { booksWith, memberId, organisationId, spell } from './costShareMembers.fixtures';

describe('setCostShareMemberWeight', () => {
	it('changes the weight in place from the month the member joined', async () => {
		const books = booksWith([spell(memberId, '2026-07-01', null)]);
		await setCostShareMemberWeight(books.supabase, organisationId, { memberId, fromMonth: '2026-07', weight: 3 });
		expect(books.writes).toEqual([expect.objectContaining({ weight: 3 })]);
	});

	it('ends the spell the month before a later change and carries the new weight on in a spell of its own', async () => {
		const books = booksWith([spell(memberId, '2026-01-01', '2026-12-01')]);
		await setCostShareMemberWeight(books.supabase, organisationId, { memberId, fromMonth: '2026-07', weight: 2 });
		expect(books.writes).toEqual([
			expect.objectContaining({ left_month: '2026-06-01' }),
			expect.objectContaining({ joined_month: '2026-07-01', left_month: '2026-12-01', weight: 2 })
		]);
	});

	it('refuses a month the member does not share, and a weight of nothing, writing nothing', async () => {
		const books = booksWith([spell(memberId, '2026-07-01', null)]);
		await expect(setCostShareMemberWeight(books.supabase, organisationId, { memberId, fromMonth: '2026-06', weight: 2 })).rejects.toThrow('fromMonth');
		await expect(setCostShareMemberWeight(books.supabase, organisationId, { memberId, fromMonth: '2026-07', weight: 0 })).rejects.toThrow('above 0');
		expect(books.writes).toEqual([]);
	});
});
