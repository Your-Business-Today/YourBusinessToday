import { describe, expect, it } from 'vitest';
import { destinationRefusal, messagesFromHereOnwards, moveDestinations } from './chatMoveChoices';
import { chatMoveRefusals as refusals } from './chatMoveRules';
import { chatRoomTree } from './chatRoomTree';
import type { ChatRoom } from './chatRoomRules';

const room = (id: string, name: string, extra: Partial<ChatRoom> = {}): ChatRoom => ({
	id,
	name,
	purpose: '',
	parentRoomId: null,
	isGeneral: false,
	isArchived: false,
	...extra
});

const rooms: ChatRoom[] = [
	room('general', 'General', { isGeneral: true }),
	room('finance', 'Finance'),
	room('invoices', 'Invoices', { parentRoomId: 'finance' }),
	room('gone', 'Gone', { isArchived: true })
];

const messages = ['first', 'second', 'third', 'fourth'].map((id) => ({ id }));

describe('messagesFromHereOnwards', () => {
	it('takes the message picked and every one after it, in the room’s order', () => {
		expect(messagesFromHereOnwards(messages, 'second').map(({ id }) => id)).toEqual(['second', 'third', 'fourth']);
		expect(messagesFromHereOnwards(messages, 'fourth').map(({ id }) => id)).toEqual(['fourth']);
		expect(messagesFromHereOnwards(messages, 'first')).toHaveLength(messages.length);
	});

	it('takes nothing when the message picked is no longer in the room', () => {
		expect(messagesFromHereOnwards(messages, 'moved-away')).toEqual([]);
	});
});

describe('destinationRefusal', () => {
	it('lets messages go to another room of the organisation that is open, a subroom among them', () => {
		expect(destinationRefusal(rooms, 'general', 'finance')).toBeNull();
		expect(destinationRefusal(rooms, 'general', 'invoices')).toBeNull();
		expect(destinationRefusal(rooms, 'gone', 'general')).toBeNull();
	});

	it('refuses this room, an archived room and a room the organisation does not have', () => {
		expect(destinationRefusal(rooms, 'general', 'general')).toBe(refusals.sameRoom);
		expect(destinationRefusal(rooms, 'general', 'gone')).toBe(refusals.destinationArchived);
		expect(destinationRefusal(rooms, 'general', 'another-organisations-room')).toBe(refusals.destinationNotListed);
	});
});

describe('moveDestinations', () => {
	it('offers every open room but this one, each subroom beneath its room', () => {
		expect(moveDestinations(chatRoomTree(rooms), 'general').map(({ id, isSubroom }) => [id, isSubroom])).toEqual([
			['finance', false],
			['invoices', true]
		]);
	});
});
