import { beforeEach, describe, expect, it, vi } from 'vitest';
import { raiseChatDecision } from './raiseChatDecision';
import { chatDecisionRefusals } from '$lib/data/chat/chatDecisionRules';
import { chatMessageRefusals } from '$lib/data/chat/chatMessageRules';
import type { SupabaseClient } from '@supabase/supabase-js';

const finance = { id: 'finance', name: 'Finance', purpose: '', parentRoomId: null, isGeneral: false, isArchived: false };
const oldRoom = { ...finance, id: 'old', name: 'Old', isArchived: true };
const nigel = { id: 'nigel-account', name: 'Nigel', email: 'nigel@jewel.example', isManager: false, since: '2026-01-01' };
vi.mock('./readChatRooms', () => ({ readChatRooms: async () => [finance, oldRoom] }));
vi.mock('$lib/server/organisations/getMembersOfOrganisation', async (original) => ({
	...(await original<object>()),
	getMembersOfOrganisation: async () => [nigel]
}));

const messageId = '11111111-1111-4111-8111-111111111111';
const jamesOnJewel = { organisationId: 'jewel', accountId: 'james', postedVia: 'site' as const };
const world = { inserts: [] as Record<string, unknown>[], isMessageInRoom: true, messageLookups: [] as [string, unknown][][] };

function serviceRole() {
	const lookup: [string, unknown][] = [];
	const message = {
		select: () => message,
		eq: (column: string, value: unknown) => (lookup.push([column, value]), message),
		maybeSingle: async () => (world.messageLookups.push(lookup), { data: world.isMessageInRoom ? { id: messageId } : null, error: null })
	};
	const inserting = (row: Record<string, unknown>) => {
		world.inserts.push(row);
		const saved = { id: 'd1', status: 'open', outcome: null, closed_by_account_id: null, closed_at: null, created_at: '2026-11-23T10:00:00Z', ...row };
		return { select: () => ({ single: async () => ({ data: saved, error: null }) }) };
	};
	return { from: (table: string) => (table === 'chat_messages' ? message : { insert: inserting }) } as unknown as SupabaseClient;
}

const raise = (roomId: string, input: Record<string, unknown>) => raiseChatDecision(serviceRole(), jamesOnJewel, roomId, input);
const asked = { messageId, wording: ' Do we take the Leeds job? ', waitingOn: 'Nigel' };

describe('raiseChatDecision', () => {
	beforeEach(() => Object.assign(world, { inserts: [], isMessageInRoom: true, messageLookups: [] }));

	it('raises the decision in the room from the message, waiting on the person named, as raised on the site', async () => {
		const raised = await raise('finance', asked);
		expect(world.messageLookups).toEqual([[['id', messageId], ['organisation_id', 'jewel'], ['room_id', 'finance']]]);
		expect(world.inserts).toEqual([
			{
				organisation_id: 'jewel',
				room_id: 'finance',
				message_id: messageId,
				wording: 'Do we take the Leeds job?',
				raised_by_account_id: 'james',
				raised_via: 'site',
				waiting_on_account_id: 'nigel-account'
			}
		]);
		expect(raised).toMatchObject({ id: 'd1', status: 'open', waitingOnAccountId: 'nigel-account', outcome: null });
	});

	it('refuses a room of another organisation and an archived room', async () => {
		expect(await raise('elsewhere', asked)).toBe(chatMessageRefusals.noSuchRoom);
		expect(await raise('old', asked)).toBe(chatDecisionRefusals.archivedRoom);
		expect(world.inserts).toEqual([]);
	});

	it('refuses a message not in the room now, and a person not on the organisation', async () => {
		world.isMessageInRoom = false;
		expect(await raise('finance', asked)).toBe(chatDecisionRefusals.messageNotInRoom);
		world.isMessageInRoom = true;
		expect(await raise('finance', { ...asked, waitingOn: 'someone@else.example' })).toBe(chatDecisionRefusals.notAPerson);
		expect(world.inserts).toEqual([]);
	});

	it('refuses wording that does not fit before anything is read', async () => {
		expect(await raise('finance', { ...asked, wording: '' })).toBe(chatDecisionRefusals.wording);
		expect(world.messageLookups).toEqual([]);
	});
});
