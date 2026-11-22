import { describe, expect, it } from 'vitest';
import { describeChatRoomReading, describeChatUnread } from './describeChatRoom';
import { chatFlowKinds } from '$lib/data/chat/chatRoomFlow';
import type { ChatRoomReading } from '$lib/server/chat/readChatRoomAsAsked';
import type { ChatRoomMessage } from '$lib/server/chat/readChatFlowOfRoom';

const finance = { id: 'finance', name: 'Finance', purpose: 'Money in and out.', parentRoomId: null, isGeneral: false, isArchived: false };

const vatMessage: ChatRoomMessage = {
	id: 'm1',
	roomId: 'finance',
	authorAccountId: 'nigel',
	authorName: 'Nigel Smith',
	body: 'The VAT return is in.\nPaid on Friday.',
	postedVia: 'claude',
	createdAt: '2026-11-22T09:15:00Z',
	movedByMoveId: 'move-1',
	movedHere: { fromRoomName: 'General', moverName: 'James' }
};

const movedAway = {
	kind: chatFlowKinds.movedAway,
	key: 'move-move-2',
	moment: '2026-11-22T10:00:00Z',
	marker: { moveId: 'move-2', toRoomId: 'ops', toRoomName: 'Operations', moverName: 'James', messageCount: 2, movedAt: '2026-11-22T10:00:00Z' }
};

const reading: ChatRoomReading = {
	room: finance,
	since: 'unread',
	entries: [{ kind: chatFlowKinds.message, key: 'm1', moment: vatMessage.createdAt, message: vatMessage }, movedAway],
	messagesLeftOut: 0
};

describe('describeChatRoomReading', () => {
	it('gives each message with when, who said it and how, its id, where it came from, then its words', () => {
		expect(describeChatRoomReading('Jewel', reading)).toBe(
			[
				"Finance, in Jewel's chat, room finance — Money in and out.",
				'New to you since you last read it, oldest first:',
				"- 22 Nov 2026, 09:15 — Nigel Smith's Claude, message m1, moved from General by James:\n  The VAT return is in.\n  Paid on Friday.",
				'- 22 Nov 2026, 10:00 — Moved 2 messages to Operations, by James; they are read in Operations now, room ops.',
				'Reading marks nothing read: your place in the room and your notification for it stay as they were.'
			].join('\n')
		);
	});

	it('names a person who said it themselves, says a room is archived, and counts what the limit left out', () => {
		const ownWords = { ...vatMessage, postedVia: 'site' as const, movedHere: null };
		const archived = { ...reading, room: { ...finance, isArchived: true }, since: 'all' as const, messagesLeftOut: 4 };
		const entries = [{ kind: chatFlowKinds.message, key: 'm1', moment: ownWords.createdAt, message: ownWords }];
		const answer = describeChatRoomReading('Jewel', { ...archived, entries });
		expect(answer).toContain('This room is archived: it is read, never written in.');
		expect(answer).toContain('Its latest messages, oldest first:');
		expect(answer).toContain('- 22 Nov 2026, 09:15 — Nigel Smith, message m1:');
		expect(answer).toContain('4 earlier ones are left out');
	});

	it('says when nothing is new', () => {
		expect(describeChatRoomReading('Jewel', { ...reading, entries: [] })).toContain('Nothing is new to you here since you last read it.');
	});
});

describe('describeChatUnread', () => {
	it('gives each room with something new, in the order given, or one line when nothing is', () => {
		const answer = describeChatUnread('Jewel', [reading]);
		expect(answer.startsWith("New to you in Jewel's chat, room by room. Reading marks nothing read.\n\nFinance, in Jewel's chat")).toBe(true);
		expect(describeChatUnread('Jewel', [])).toBe("Nothing is unread in Jewel's chat.");
	});
});
