import { describe, expect, it } from 'vitest';
import { postingRefusal } from './chatRoomPosting';
import { chatMessageRefusals } from './chatMessageRules';
import type { ChatRoom } from './chatRoomRules';

const finance: ChatRoom = { id: 'finance', name: 'Finance', purpose: '', parentRoomId: null, isGeneral: false, isArchived: false };

describe('postingRefusal', () => {
	it('lets anyone talk in a room that is open', () => {
		expect(postingRefusal(finance)).toBeNull();
	});

	it('refuses a room that is archived', () => {
		expect(postingRefusal({ ...finance, isArchived: true })).toBe(chatMessageRefusals.archivedRoom);
	});

	it('refuses a room the organisation does not have', () => {
		expect(postingRefusal(undefined)).toBe(chatMessageRefusals.noSuchRoom);
	});
});
