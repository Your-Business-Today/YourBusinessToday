import { describe, expect, it } from 'vitest';
import { needsTemplateRooms } from './chatTemplateRooms';
import { chatRoomLimits, generalRoomName, templateRooms, type ChatRoom } from './chatRoomRules';

const archivedRoom: ChatRoom = {
	id: 'old',
	name: 'Old',
	purpose: '',
	parentRoomId: null,
	isGeneral: false,
	isArchived: true
};

describe('needsTemplateRooms', () => {
	it('opens the template rooms for an organisation whose chat has never had a room', () => {
		expect(needsTemplateRooms([])).toBe(true);
	});

	it('opens nothing once any room has been kept, even one since archived', () => {
		expect(needsTemplateRooms([archivedRoom])).toBe(false);
	});
});

describe('the template rooms', () => {
	it('are General, Operations, Finance and Company decisions, with General the one General room', () => {
		expect(templateRooms.map(({ name }) => name)).toEqual([generalRoomName, 'Operations', 'Finance', 'Company decisions']);
		expect(templateRooms.filter(({ isGeneral }) => isGeneral).map(({ name }) => name)).toEqual([generalRoomName]);
	});

	it('fit the columns they are written to', () => {
		const tooLong = templateRooms.filter(({ name, purpose }) => name.length > chatRoomLimits.longestName || purpose.length > chatRoomLimits.longestPurpose);
		expect(tooLong).toEqual([]);
	});
});
