import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listChatDecisionsAsked } from './listChatDecisionsAsked';
import { chatDecisionLimits, chatDecisionListingRefusals } from '$lib/data/chat/chatDecisionRules';
import { chatMessageRefusals } from '$lib/data/chat/chatMessageRules';
import { closedByNigel, waitingOnJames, waitingOnNigel } from './chatDecisionsListed.fixture';
import type { SupabaseClient } from '@supabase/supabase-js';

const finance = { id: waitingOnNigel.roomId, name: 'Finance', purpose: '', parentRoomId: null, isGeneral: false, isArchived: true };
const { ofRoom, ofOrganisation } = vi.hoisted(() => ({ ofRoom: vi.fn(), ofOrganisation: vi.fn() }));
vi.mock('./readChatRooms', () => ({ readChatRooms: async () => [finance] }));
vi.mock('./listChatDecisions', () => ({ listDecisionsOfRoom: ofRoom, listDecisionsOfOrganisation: ofOrganisation }));

const supabase = {} as SupabaseClient;
const jewelId = 'jewel';
const elsewhereRoomId = '00000000-0000-4000-8000-0000000000ff';

describe('listChatDecisionsAsked', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		ofRoom.mockResolvedValue([waitingOnNigel, waitingOnJames, closedByNigel]);
		ofOrganisation.mockResolvedValue([waitingOnNigel, closedByNigel]);
	});

	it('lists every room’s decisions through chat home’s read, open first as it gives them', async () => {
		const listing = await listChatDecisionsAsked(supabase, jewelId, {});
		expect(ofOrganisation).toHaveBeenCalledWith(supabase, jewelId, [finance]);
		expect(listing).toEqual({ room: null, status: null, decisions: [waitingOnNigel, closedByNigel], decisionsLeftOut: 0, isAtMostRead: false });
	});

	it('lists one room’s, archived or not, through the room’s own read, cut to the status and the limit', async () => {
		const listing = await listChatDecisionsAsked(supabase, jewelId, { roomId: finance.id, status: 'open', limit: 1 });
		expect(ofRoom).toHaveBeenCalledWith(supabase, finance.id, [finance]);
		expect(listing).toMatchObject({ room: finance, status: 'open', decisions: [waitingOnNigel], decisionsLeftOut: 1 });
	});

	it('says when it reached the most the site reads', async () => {
		ofOrganisation.mockResolvedValue(Array.from({ length: chatDecisionLimits.latestDecisionsShown }, () => waitingOnNigel));
		expect(await listChatDecisionsAsked(supabase, jewelId, {})).toMatchObject({ isAtMostRead: true });
	});

	it('refuses a room of another organisation and what does not fit, reading nothing', async () => {
		expect(await listChatDecisionsAsked(supabase, jewelId, { roomId: elsewhereRoomId })).toBe(chatMessageRefusals.noSuchRoom);
		expect(await listChatDecisionsAsked(supabase, jewelId, { status: 'waiting' })).toBe(chatDecisionListingRefusals.status);
		expect(ofRoom).not.toHaveBeenCalled();
		expect(ofOrganisation).not.toHaveBeenCalled();
	});
});
