import { describe, expect, it, vi } from 'vitest';
import { listDecisionsOfOrganisation, listDecisionsOfRoom } from './listChatDecisions';
import type { SupabaseClient } from '@supabase/supabase-js';

vi.mock('$lib/server/payments/supabaseServiceClient', () => ({ supabaseServiceClient: () => ({}) }));
vi.mock('$lib/server/accounts/getAccountsById', () => ({
	getAccountsById: async () => [
		{ id: 'james', name: 'James', email: 'james@jewel.example' },
		{ id: 'nigel', name: 'Nigel', email: 'nigel@jewel.example' }
	]
}));

const finance = { id: 'finance', name: 'Finance', purpose: '', parentRoomId: null, isGeneral: false, isArchived: false };
const row = {
	room_id: 'finance',
	message_id: 'm1',
	wording: 'Take the Leeds job?',
	raised_by_account_id: 'james',
	raised_via: 'claude',
	waiting_on_account_id: 'nigel',
	outcome: null,
	closed_by_account_id: null,
	closed_at: null
};
const closedRow = { ...row, id: 'd1', status: 'closed', outcome: 'Yes.', closed_by_account_id: 'nigel', closed_at: '2026-11-22T09:00:00Z', created_at: '2026-11-21T09:00:00Z' };
const openRow = { ...row, id: 'd2', status: 'open', created_at: '2026-11-20T09:00:00Z' };

function reader(decisions: { data: unknown; error: unknown }) {
	const decisionQuery = { select: () => decisionQuery, eq: () => decisionQuery, order: () => decisionQuery, limit: async () => decisions };
	const messageQuery = { select: () => messageQuery, in: async () => ({ data: [{ id: 'm1', body: 'Leeds want us in March.' }], error: null }) };
	return { from: (table: string) => (table === 'chat_messages' ? messageQuery : decisionQuery) } as unknown as SupabaseClient;
}

describe('listDecisionsOfRoom and listDecisionsOfOrganisation', () => {
	it('lists the open decisions first, with the people, the room and the message’s words', async () => {
		const listed = await listDecisionsOfRoom(reader({ data: [closedRow, openRow], error: null }), 'finance', [finance]);
		expect(listed.map((decision) => decision.id)).toEqual(['d2', 'd1']);
		expect(listed[1]).toMatchObject({ roomName: 'Finance', messageWords: 'Leeds want us in March.', raiserName: 'James', raisedVia: 'claude' });
		expect(listed[1]).toMatchObject({ waitingOnName: 'Nigel', closerName: 'Nigel', outcome: 'Yes.' });
		expect(listed[0].closerName).toBeNull();
	});

	it('answers none while migration 0277 has not run, since chat home and the room ask on every visit', async () => {
		const notYet = { data: null, error: { code: '42P01', message: 'relation "public.chat_decisions" does not exist' } };
		expect(await listDecisionsOfOrganisation(reader(notYet), 'jewel', [finance])).toEqual([]);
	});
});
