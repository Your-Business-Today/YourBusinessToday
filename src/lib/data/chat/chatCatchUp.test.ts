import { describe, expect, it } from 'vitest';
import { catchUpOf, unreadMessagesOf } from './chatCatchUp';
import { askYourClaudeToCatchUp, coverageSentence, missedSentence, writerOfSummary } from './chatCatchUpWords';
import type { NamedChatSummary } from './chatSummaryRules';

const said = (id: string, authorAccountId: string, createdAt: string) => ({ id, authorAccountId, createdAt });
const messages = [said('m1', 'james', '2026-11-20T09:00:00Z'), said('m2', 'nigel', '2026-11-21T09:00:00Z'), said('m3', 'james', '2026-11-22T09:00:00Z'), said('m4', 'james', '2026-11-22T11:00:00Z')];

const summary: NamedChatSummary = {
	id: 's1',
	roomId: 'finance',
	coversUpTo: '2026-11-22T09:00:00Z',
	words: 'James sent the VAT return.',
	writtenByAccountId: 'james',
	writtenVia: 'claude',
	createdAt: '2026-11-22T10:00:00Z',
	writerName: 'James'
};

describe('unreadMessagesOf', () => {
	it('counts what was said after the reader’s place and not by them, every message not theirs in a room never opened', () => {
		expect(unreadMessagesOf(messages, 'nigel', '2026-11-21T00:00:00Z').map((message) => message.id)).toEqual(['m3', 'm4']);
		expect(unreadMessagesOf(messages, 'nigel', null).map((message) => message.id)).toEqual(['m1', 'm3', 'm4']);
		expect(unreadMessagesOf(messages, 'nigel', '2026-11-22T12:00:00Z')).toEqual([]);
	});
});

describe('catchUpOf', () => {
	it('gives the latest catch-up and how many unread messages came after the moment it covers', () => {
		const unread = unreadMessagesOf(messages, 'nigel', '2026-11-21T00:00:00Z');
		expect(catchUpOf(unread, summary)).toEqual({ summary, messagesAfterSummary: 1 });
		expect(catchUpOf(unread, { ...summary, coversUpTo: '2026-11-22T11:00:00Z' })).toEqual({ summary: { ...summary, coversUpTo: '2026-11-22T11:00:00Z' }, messagesAfterSummary: 0 });
		expect(catchUpOf(unread, null)).toEqual({ summary: null, messagesAfterSummary: 2 });
	});
});

describe('the words of the catch-up above a room', () => {
	it('names who wrote it and how, and what it covers up to', () => {
		expect(writerOfSummary(summary)).toBe("James's Claude");
		expect(writerOfSummary({ ...summary, writtenVia: 'site' })).toBe('James');
		expect(coverageSentence(summary)).toMatch(/^Covers up to 22 Nov, \d\d:00, written by James's Claude\.$/);
	});

	it('says in one plain line what came after it, and asks the reader’s Claude when there is none', () => {
		expect(missedSentence(0)).toBeNull();
		expect(missedSentence(1)).toBe('1 new message came after this catch-up: read it below.');
		expect(missedSentence(3)).toBe('3 new messages came after this catch-up: read them below.');
		expect(askYourClaudeToCatchUp).toBe('Ask your Claude to catch you up on this room.');
	});
});
