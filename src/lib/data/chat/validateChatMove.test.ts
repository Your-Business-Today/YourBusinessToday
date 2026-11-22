import { describe, expect, it } from 'vitest';
import { chosenCountRefusal, validateChatMove } from './validateChatMove';
import { chatMoveLimits, chatMoveRefusals } from './chatMoveRules';

const roomId = '00000000-0000-4000-8000-000000000001';
const idNumbered = (place: number) => `00000000-0000-4000-8000-${String(place).padStart(12, '0')}`;

describe('validateChatMove', () => {
	it('takes the messages chosen, each once, and the room to send them to', () => {
		const first = idNumbered(10);
		expect(validateChatMove({ messageIds: [first, ` ${first} `, idNumbered(11)], toRoomId: roomId })).toEqual({
			messageIds: [first, idNumbered(11)],
			toRoomId: roomId
		});
	});

	it('refuses a move with no messages chosen', () => {
		expect(validateChatMove({ messageIds: [], toRoomId: roomId })).toBe(chatMoveRefusals.noMessages);
	});

	it('takes the most messages one move holds and refuses one more, naming the limit', () => {
		const most = Array.from({ length: chatMoveLimits.mostMessagesInOneMove }, (_, place) => idNumbered(place));
		expect(validateChatMove({ messageIds: most, toRoomId: roomId })).not.toBeTypeOf('string');
		const tooMany = [...most, idNumbered(chatMoveLimits.mostMessagesInOneMove)];
		expect(validateChatMove({ messageIds: tooMany, toRoomId: roomId })).toBe(chatMoveRefusals.tooMany);
		expect(chatMoveRefusals.tooMany).toContain(String(chatMoveLimits.mostMessagesInOneMove));
	});

	it('refuses a message or a room that is not an id', () => {
		expect(validateChatMove({ messageIds: ['the third one'], toRoomId: roomId })).toContain('message must be an id');
		expect(validateChatMove({ messageIds: [idNumbered(1)], toRoomId: 'Finance' })).toContain('room to move them to');
	});
});

describe('chosenCountRefusal', () => {
	it('asks the form the same question the service asks', () => {
		expect(chosenCountRefusal(0)).toBe(chatMoveRefusals.noMessages);
		expect(chosenCountRefusal(1)).toBeNull();
		expect(chosenCountRefusal(chatMoveLimits.mostMessagesInOneMove + 1)).toBe(chatMoveRefusals.tooMany);
	});
});
