import { describe, expect, it } from 'vitest';
import { validateChatRoomFields } from './validateChatRoomFields';
import { chatRoomFieldRefusals, chatRoomLimits } from './chatRoomRules';

const parentId = '00000000-0000-4000-8000-000000000001';

describe('validateChatRoomFields', () => {
	it('takes a room as given, the space around each field gone, and no parent as none', () => {
		expect(
			validateChatRoomFields({
				name: ' Estimating ',
				purpose: ' Prices for tenders ',
				parentRoomId: ''
			})
		).toEqual({
			name: 'Estimating',
			purpose: 'Prices for tenders',
			parentRoomId: null
		});
		expect(validateChatRoomFields({ name: 'Site visits', parentRoomId: parentId })).toEqual({ name: 'Site visits', purpose: '', parentRoomId: parentId });
	});

	it('refuses a blank name and one past its limit, never cutting it short', () => {
		expect(validateChatRoomFields({ name: '  ' })).toBe(chatRoomFieldRefusals.name);
		expect(
			validateChatRoomFields({
				name: 'a'.repeat(chatRoomLimits.longestName + 1)
			})
		).toBe(chatRoomFieldRefusals.name);
		expect(validateChatRoomFields({ name: 'a'.repeat(chatRoomLimits.longestName) })).not.toBeTypeOf('string');
	});

	it('refuses what the room is for past its limit', () => {
		const purpose = 'a'.repeat(chatRoomLimits.longestPurpose + 1);
		expect(validateChatRoomFields({ name: 'Finance', purpose })).toBe(chatRoomFieldRefusals.purpose);
	});

	it('refuses a parent that is not an id', () => {
		expect(validateChatRoomFields({ name: 'Finance', parentRoomId: 'Operations' })).toContain('room it sits under');
	});

	it('names each field and its limit in its refusal', () => {
		expect(chatRoomFieldRefusals.name).toContain(String(chatRoomLimits.longestName));
		expect(chatRoomFieldRefusals.purpose).toContain(String(chatRoomLimits.longestPurpose));
	});
});
