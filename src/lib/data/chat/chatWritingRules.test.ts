import { describe, expect, it } from 'vitest';
import { chatWritingRefusals, roomFieldsWithChanges, validateChatRoomUpdate, validateMoveOverConnector } from './chatWritingRules';

const parentId = '00000000-0000-4000-8000-000000000001';
const finance = { id: 'finance', name: 'Finance', purpose: 'Money in and out.', parentRoomId: null, isGeneral: false, isArchived: false };

describe('validateChatRoomUpdate', () => {
	it('changes only the fields given', () => {
		expect(validateChatRoomUpdate({ roomId: 'finance', purpose: 'The bank.' })).toEqual({ isArchiving: false, changes: { purpose: 'The bank.' } });
	});

	it('archives a room asked for alone, and refuses an archive with changes beside it', () => {
		expect(validateChatRoomUpdate({ roomId: 'finance', isArchived: true })).toEqual({ isArchiving: true });
		expect(validateChatRoomUpdate({ roomId: 'finance', isArchived: true, name: 'Money' })).toBe(chatWritingRefusals.archiveAlone);
	});

	it('never brings an archived room back, as the site never does', () => {
		expect(validateChatRoomUpdate({ roomId: 'finance', isArchived: false })).toBe(chatWritingRefusals.isArchived);
		expect(validateChatRoomUpdate({ roomId: 'finance', isArchived: 'yes' })).toBe(chatWritingRefusals.isArchived);
	});

	it('refuses an update that asks for nothing', () => {
		expect(validateChatRoomUpdate({ roomId: 'finance' })).toBe(chatWritingRefusals.nothingAsked);
	});
});

describe('roomFieldsWithChanges', () => {
	it('keeps every field left out as the room has it', () => {
		expect(roomFieldsWithChanges(finance, { name: 'Money' })).toEqual({ roomId: 'finance', name: 'Money', purpose: 'Money in and out.', parentRoomId: '' });
		expect(roomFieldsWithChanges({ ...finance, parentRoomId: parentId }, {})).toMatchObject({ parentRoomId: parentId });
	});

	it('puts a room back under nothing when it is given no parent', () => {
		expect(roomFieldsWithChanges({ ...finance, parentRoomId: parentId }, { parentRoomId: '' })).toMatchObject({ parentRoomId: '' });
	});
});

describe('validateMoveOverConnector', () => {
	it('takes the messages as a list, and refuses one given alone rather than reading it as a list', () => {
		expect(validateMoveOverConnector({ messageIds: [parentId], toRoomId: 'finance' })).toEqual({ messageIds: [parentId], toRoomId: 'finance' });
		expect(validateMoveOverConnector({ messageIds: parentId, toRoomId: 'finance' })).toBe(chatWritingRefusals.messagesNotAList);
	});
});
