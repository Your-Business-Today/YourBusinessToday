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
	movedHere: { fromRoomName: 'General', moverName: 'James' },
	files: []
};

const noLinks = new Map<string, string>();

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
	messagesLeftOut: 0,
	latestSummary: null
};

describe('describeChatRoomReading', () => {
	it('gives each message with when, who said it and how, its id, where it came from, then its words', () => {
		expect(describeChatRoomReading('Jewel', reading, noLinks)).toBe(
			[
				"Finance, in Jewel's chat, room finance — Money in and out.",
				'No catch-up has been written of this room yet.',
				'New to you since you last read it, oldest first:',
				"- 22 Nov 2026, 09:15 — Nigel Smith's Claude, message m1, moved from General by James:\n  The VAT return is in.\n  Paid on Friday.",
				'- 22 Nov 2026, 10:00 — Moved 2 messages to Operations, by James; they are read in Operations now, room ops.',
				'To save a catch-up of these messages with record_chat_summary, give coversUpTo 2026-11-22T09:15:00Z.',
				'Reading marks nothing read: your place in the room and your notification for it stay as they were.'
			].join('\n')
		);
	});

	it('names a person who said it themselves, says a room is archived, and counts what the limit left out', () => {
		const ownWords = { ...vatMessage, postedVia: 'site' as const, movedHere: null };
		const archived = { ...reading, room: { ...finance, isArchived: true }, since: 'all' as const, messagesLeftOut: 4 };
		const entries = [{ kind: chatFlowKinds.message, key: 'm1', moment: ownWords.createdAt, message: ownWords }];
		const answer = describeChatRoomReading('Jewel', { ...archived, entries }, noLinks);
		expect(answer).toContain('This room is archived: it is read, never written in.');
		expect(answer).toContain('Its latest messages, oldest first:');
		expect(answer).toContain('- 22 Nov 2026, 09:15 — Nigel Smith, message m1:');
		expect(answer).toContain('4 earlier ones are left out');
	});

	it('gives a message of photos alone with no words, each file named with its kind, size and link to fetch it', () => {
		const slab = { id: 'f1', storagePath: 'jewel/nigel/u1/slab.jpg', fileName: 'slab.jpg', contentType: 'image/jpeg', sizeBytes: 2_097_152 };
		const plan = { id: 'f2', storagePath: 'jewel/nigel/u2/plan.pdf', fileName: 'plan.pdf', contentType: 'application/pdf', sizeBytes: 2048 };
		const photosAlone = { ...vatMessage, body: '', movedHere: null, files: [slab, plan] };
		const entries = [{ kind: chatFlowKinds.message, key: 'm1', moment: photosAlone.createdAt, message: photosAlone }];
		const links = new Map([[slab.storagePath, 'https://files.example/slab']]);
		const answer = describeChatRoomReading('Jewel', { ...reading, entries }, links);
		expect(answer).toContain(
			[
				"- 22 Nov 2026, 09:15 — Nigel Smith's Claude, message m1:",
				'  Files: sent a photo and a file. Fetch each within 10 minutes, to look at it now; do not pass the links on:',
				'  - slab.jpg, image/jpeg, 2.0 MB: https://files.example/slab',
				'  - plan.pdf, application/pdf, 2 KB: no link could be made just now; read the room again for one'
			].join('\n')
		);
	});

	it('says when nothing is new', () => {
		expect(describeChatRoomReading('Jewel', { ...reading, entries: [] }, noLinks)).toContain('Nothing is new to you here since you last read it.');
	});
});

describe('describeChatUnread', () => {
	it('gives each room with something new, in the order given, or one line when nothing is', () => {
		const answer = describeChatUnread('Jewel', [reading], noLinks);
		expect(answer.startsWith("New to you in Jewel's chat, room by room. Reading marks nothing read.\n\nFinance, in Jewel's chat")).toBe(true);
		expect(describeChatUnread('Jewel', [], noLinks)).toBe("Nothing is unread in Jewel's chat.");
	});
});
