import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateChatRoom } from './updateChatRoom';
import { chatRoomPlacementRefusals } from '$lib/data/chat/chatRoomPlacement';
import { chatWritingRefusals } from '$lib/data/chat/chatWritingRules';
import type { SupabaseClient } from '@supabase/supabase-js';

const parentId = '00000000-0000-4000-8000-000000000001';
const finance = { id: 'finance', name: 'Finance', purpose: 'Money in and out.', parentRoomId: parentId, isGeneral: false, isArchived: false };
const supabase = {} as SupabaseClient;

const { archiving, changing } = vi.hoisted(() => ({ archiving: vi.fn(), changing: vi.fn() }));
vi.mock('./readChatRooms', () => ({ readChatRooms: async () => [finance, { ...finance, id: 'old', isArchived: true }] }));
vi.mock('./keepChatRooms', () => ({ archiveChatRoom: archiving, changeChatRoom: changing }));

describe('updateChatRoom', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		archiving.mockResolvedValue({ ...finance, isArchived: true });
		changing.mockResolvedValue(finance);
	});

	it('changes the fields given through the site’s Edit, keeping every field left out', async () => {
		await updateChatRoom(supabase, 'jewel', { roomId: 'finance', name: 'Money' });
		expect(changing).toHaveBeenCalledWith(supabase, 'jewel', { roomId: 'finance', name: 'Money', purpose: 'Money in and out.', parentRoomId: parentId });
		expect(archiving).not.toHaveBeenCalled();
	});

	it('archives through the site’s Archive, with its refusals', async () => {
		archiving.mockResolvedValue(chatRoomPlacementRefusals.generalIsNeverArchived);
		expect(await updateChatRoom(supabase, 'jewel', { roomId: 'general', isArchived: true })).toBe(chatRoomPlacementRefusals.generalIsNeverArchived);
		expect(archiving).toHaveBeenCalledWith(supabase, 'jewel', 'general');
		expect(changing).not.toHaveBeenCalled();
	});

	it('refuses a room that is archived or not the organisation’s, changing nothing', async () => {
		expect(await updateChatRoom(supabase, 'jewel', { roomId: 'old', name: 'Old' })).toBe(chatRoomPlacementRefusals.roomNotListed);
		expect(await updateChatRoom(supabase, 'jewel', { roomId: 'elsewhere', name: 'Elsewhere' })).toBe(chatRoomPlacementRefusals.roomNotListed);
		expect(changing).not.toHaveBeenCalled();
	});

	it('refuses an update that asks for nothing before reading anything', async () => {
		expect(await updateChatRoom(supabase, 'jewel', { roomId: 'finance' })).toBe(chatWritingRefusals.nothingAsked);
	});
});
