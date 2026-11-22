import { describe, expect, it } from 'vitest';
import { chatRoomFlow, messagesIn, movedAwaySentence, movedHereNote, type MovedAwayMarker } from './chatRoomFlow';
import { chatMessageLimits } from './chatMessageRules';

const said = (id: string, createdAt: string) => ({ id, createdAt });

const marker = (moveId: string, movedAt: string): MovedAwayMarker => ({
	moveId,
	toRoomId: 'finance',
	toRoomName: 'Finance',
	moverName: 'James',
	messageCount: 3,
	movedAt
});

const keysOf = (messages: { id: string; createdAt: string }[], markers: MovedAwayMarker[]) => chatRoomFlow(messages, markers).map(({ key }) => key);

describe('the marker’s words', () => {
	it('says how many messages went where, and who moved them', () => {
		expect(movedAwaySentence({ messageCount: 3, toRoomName: 'Finance', moverName: 'James' })).toBe('Moved 3 messages to Finance, by James');
		expect(movedAwaySentence({ messageCount: 1, toRoomName: 'Finance', moverName: 'James' })).toBe('Moved 1 message to Finance, by James');
	});

	it('notes on a moved message the room it came from and who moved it', () => {
		expect(movedHereNote({ fromRoomName: 'General', moverName: 'James' })).toBe('moved from General by James');
	});
});

describe('chatRoomFlow', () => {
	const messages = [said('morning', '2026-11-22T09:00:00Z'), said('lunch', '2026-11-22T12:00:00Z')];

	it('places each move at the moment it was made among the messages, oldest first', () => {
		const markers = [marker('late', '2026-11-22T13:00:00Z'), marker('mid', '2026-11-22T10:30:00.5+00:00')];
		expect(keysOf(messages, markers)).toEqual(['morning', 'move-mid', 'lunch', 'move-late']);
	});

	it('sits a message said at the very moment of a move before the move', () => {
		expect(keysOf(messages, [marker('same', '2026-11-22T12:00:00.000+00:00')])).toEqual(['morning', 'lunch', 'move-same']);
	});

	it('shows a move older than every message when the room shows all it holds', () => {
		expect(keysOf(messages, [marker('early', '2026-11-22T08:00:00Z')])).toEqual(['move-early', 'morning', 'lunch']);
	});

	it('leaves out a move older than every message shown when the room shows only its latest', () => {
		const latest = Array.from({ length: chatMessageLimits.latestMessagesShown }, (_, place) => said(`m${place}`, new Date(Date.UTC(2026, 10, 22, 9, place)).toISOString()));
		const keys = keysOf(latest, [marker('early', '2026-11-22T08:00:00Z'), marker('among', '2026-11-22T09:00:30Z')]);
		expect(keys).not.toContain('move-early');
		expect(keys.indexOf('move-among')).toBe(1);
	});

	it('is the messages alone when nothing has moved away', () => {
		expect(keysOf(messages, [])).toEqual(['morning', 'lunch']);
	});

	it('gives back the messages alone, in order, from a flow with moves among them', () => {
		const flow = chatRoomFlow(messages, [marker('mid', '2026-11-22T10:30:00Z')]);
		expect(messagesIn(flow)).toEqual(messages);
	});
});
