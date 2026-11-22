import { describe, expect, it } from 'vitest';
import { chatFlowWithin } from './chatFlowWithin';
import { chatRoomFlow, type MovedAwayMarker } from './chatRoomFlow';

const said = (id: string, createdAt: string) => ({ id, createdAt });
const movedAway = (moveId: string, movedAt: string): MovedAwayMarker => ({
	moveId,
	toRoomId: 'finance',
	toRoomName: 'Finance',
	moverName: 'James',
	messageCount: 2,
	movedAt
});

const flow = chatRoomFlow(
	[said('m1', '2026-11-20T09:00:00Z'), said('m2', '2026-11-21T09:00:00Z'), said('m3', '2026-11-22T09:00:00Z')],
	[movedAway('early', '2026-11-20T10:00:00Z'), movedAway('late', '2026-11-21T10:00:00Z')]
);
const keysOf = (entries: { key: string }[]) => entries.map((entry) => entry.key);
const everything = { unreadMessageIds: null, readUpTo: null, limit: 50 };

describe('chatFlowWithin', () => {
	it('gives the whole flow, moves among the messages, when everything is asked for', () => {
		expect(keysOf(chatFlowWithin(flow, everything).entries)).toEqual(['m1', 'move-early', 'm2', 'move-late', 'm3']);
	});

	it('gives only the unread messages, and only the moves made after the reader’s place', () => {
		const unread = { unreadMessageIds: new Set(['m3']), readUpTo: '2026-11-21T09:30:00Z', limit: 50 };
		expect(keysOf(chatFlowWithin(flow, unread).entries)).toEqual(['move-late', 'm3']);
	});

	it('tells of every move to a reader who never opened the room', () => {
		const neverOpened = { unreadMessageIds: new Set(['m1', 'm2', 'm3']), readUpTo: null, limit: 50 };
		expect(keysOf(chatFlowWithin(flow, neverOpened).entries)).toEqual(['m1', 'move-early', 'm2', 'move-late', 'm3']);
	});

	it('keeps the latest messages within the limit, with the moves among them, and counts the ones left out', () => {
		const read = chatFlowWithin(flow, { ...everything, limit: 2 });
		expect(keysOf(read.entries)).toEqual(['m2', 'move-late', 'm3']);
		expect(read.messagesLeftOut).toBe(1);
	});

	it('tells of a move even when nothing unread is left in the room', () => {
		const read = chatFlowWithin(flow, { unreadMessageIds: new Set(), readUpTo: '2026-11-21T09:30:00Z', limit: 50 });
		expect(keysOf(read.entries)).toEqual(['move-late']);
		expect(read.messagesLeftOut).toBe(0);
	});
});
