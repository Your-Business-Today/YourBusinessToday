import { describe, expect, it } from 'vitest';
import { chatRoomTree, topLevelRooms } from './chatRoomTree';
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
	room('ops', 'Operations'),
	room('site', 'site visits', { parentRoomId: 'ops' }),
	room('deliveries', 'Deliveries', { parentRoomId: 'ops' }),
	room('finance', 'Finance'),
	room('general', 'General', { isGeneral: true }),
	room('old', 'Archive me', { isArchived: true }),
	room('old-sub', 'Old subroom', { parentRoomId: 'finance', isArchived: true })
];

describe('chatRoomTree', () => {
	it('lists General first, then each room by name with its subrooms by name beneath it', () => {
		const listed = chatRoomTree(rooms).map(({ id, isSubroom }) => [id, isSubroom]);
		expect(listed).toEqual([
			['general', false],
			['finance', false],
			['ops', false],
			['deliveries', true],
			['site', true]
		]);
	});

	it('lists nothing archived', () => {
		const listedIds = chatRoomTree(rooms).map(({ id }) => id);
		expect(listedIds).not.toContain('old');
		expect(listedIds).not.toContain('old-sub');
	});
});

describe('topLevelRooms', () => {
	it('offers the rooms not archived that sit under nothing, General first', () => {
		expect(topLevelRooms(rooms).map(({ id }) => id)).toEqual(['general', 'finance', 'ops']);
	});
});
