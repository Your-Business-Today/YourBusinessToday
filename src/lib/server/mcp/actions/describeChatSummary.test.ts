import { describe, expect, it } from 'vitest';
import { coversUpToLine, describeLatestSummary, describeRecordedSummary } from './describeChatSummary';
import type { ChatRoomReading } from '$lib/server/chat/readChatRoomAsAsked';
import type { NamedChatSummary } from '$lib/data/chat/chatSummaryRules';

const summary: NamedChatSummary = {
	id: 's1',
	roomId: 'finance',
	coversUpTo: '2026-11-22T09:15:00.123456+00:00',
	words: 'Nigel paid the VAT.\nJames waits on the bank.',
	writtenByAccountId: 'nigel',
	writtenVia: 'claude',
	createdAt: '2026-11-22T10:00:00Z',
	writerName: 'Nigel Smith'
};

const finance = { id: 'finance', name: 'Finance', purpose: '', parentRoomId: null, isGeneral: false, isArchived: false };
const said = (id: string, createdAt: string) => ({ kind: 'message', key: id, moment: createdAt, message: { id, createdAt } });

describe('the catch-ups the connector tells of', () => {
	it('tells of the latest catch-up with who wrote it, when, and the moment it covers up to, then its words', () => {
		expect(describeLatestSummary(summary)).toBe(
			[
				"Latest catch-up, written by Nigel Smith's Claude on 22 Nov 2026, 10:00, covering up to 22 Nov 2026, 09:15 (2026-11-22T09:15:00.123456+00:00):",
				'  Nigel paid the VAT.',
				'  James waits on the bank.'
			].join('\n')
		);
		expect(describeLatestSummary(null)).toBe('No catch-up has been written of this room yet.');
	});

	it('gives the moment of the last message read, to save a catch-up of it, or nothing when no message was read', () => {
		const entries = [said('m1', '2026-11-22T09:00:00Z'), said('m2', '2026-11-22T09:15:00.123456+00:00')];
		const reading = { room: finance, since: 'unread', entries, messagesLeftOut: 0, latestSummary: null } as unknown as ChatRoomReading;
		expect(coversUpToLine(reading)).toBe('To save a catch-up of these messages with record_chat_summary, give coversUpTo 2026-11-22T09:15:00.123456+00:00.');
		expect(coversUpToLine({ ...reading, entries: [] })).toBeNull();
	});

	it('says a saved catch-up is for everyone in the room and marked nothing read', () => {
		expect(describeRecordedSummary('Jewel', summary)).toContain("Catch-up s1 saved for room finance of Jewel's chat, covering up to 22 Nov 2026, 09:15.");
	});
});
