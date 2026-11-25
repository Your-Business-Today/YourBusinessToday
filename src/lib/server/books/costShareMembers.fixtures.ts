import type { SupabaseClient } from '@supabase/supabase-js';

export type Row = Record<string, unknown>;

export const organisationId = '00000000-0000-4000-8000-0000000000a1';
export const costCentreId = '00000000-0000-4000-8000-00000000c001';
export const codManiaId = '00000000-0000-4000-8000-00000000b002';
export const memberId = '00000000-0000-4000-8000-00000000d001';
export const appleShare = { id: 'share-apple', cost_centre_id: costCentreId, months_covered: 12, members_by: 'named' };
export const codMania = { id: codManiaId, name: 'Cod Mania', organisation_id: organisationId };
export const spell = (id: string, joined: string, left: string | null): Row => ({
	id,
	cost_share_id: appleShare.id,
	project_id: codManiaId,
	joined_month: joined,
	left_month: left
});

const Tables = { shares: 'books_cost_shares', projects: 'projects', members: 'books_cost_share_members' } as const;

type Answer = { data: unknown; error: null };

const answerOf = (data: unknown): Answer => ({ data, error: null });

function firstAnswers(spells: Row[], share: Row): Map<string, Answer> {
	return new Map([
		[Tables.shares, answerOf(share)],
		[Tables.projects, answerOf(codMania)],
		[Tables.members, answerOf(spells)]
	]);
}

function tableChain(table: string, spells: Row[], writes: Row[], share: Row) {
	let answer = firstAnswers(spells, share).get(table) ?? answerOf(null);
	let isWriting = false;
	const isMemberLookup = (column: string) => !isWriting && column === 'id' && table === Tables.members;
	const write = (row: Row, written: Row) => {
		writes.push(row);
		isWriting = true;
		answer = answerOf(written);
		return chain;
	};
	const chain = {
		select: () => chain,
		eq: (column: string, value: unknown) => {
			const isLookup = isMemberLookup(column);
			const found = spells.find((row) => row.id === value) ?? null;
			if (isLookup) answer = answerOf(found);
			return chain;
		},
		insert: (row: Row) => write(row, { id: 'new-member', ...row }),
		update: (row: Row) => write(row, { ...spells[0], ...row }),
		single: () => chain,
		maybeSingle: () => chain,
		then: (resolve: (value: unknown) => unknown) => resolve(answer)
	};
	return chain;
}

export function booksWith(spells: Row[], share: Row = appleShare) {
	const writes: Row[] = [];
	const database = { from: (table: string) => tableChain(table, spells, writes, share) };
	return { supabase: database as unknown as SupabaseClient, writes };
}
