import { describe, expect, it } from 'vitest';
import { archiveRefusal, changeRefusal, chatRoomPlacementRefusals as refusals, parentRefusal } from './chatRoomPlacement';
import type { ChatRoom, ChatRoomFields } from './chatRoomRules';

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
	room('ops', 'Operations'),
	room('site', 'Site visits', { parentRoomId: 'ops' }),
	room('finance', 'Finance'),
	room('old-sub', 'Old subroom', { parentRoomId: 'finance', isArchived: true }),
	room('decisions', 'Company decisions'),
	room('gone', 'Gone', { isArchived: true })
];

const fields = (name: string, parentRoomId: string | null = null): ChatRoomFields => ({ name, purpose: '', parentRoomId });

describe('parentRefusal', () => {
	it('lets a room sit under nothing, or under a room not archived that sits under nothing', () => {
		expect(parentRefusal(rooms, null)).toBeNull();
		expect(parentRefusal(rooms, 'ops')).toBeNull();
	});

	it('refuses a subroom, an archived room or no room at all as the room it sits under', () => {
		expect(parentRefusal(rooms, 'site')).toBe(refusals.parentNotListed);
		expect(parentRefusal(rooms, 'gone')).toBe(refusals.parentNotListed);
		expect(parentRefusal(rooms, 'nowhere')).toBe(refusals.parentNotListed);
	});
});

describe('changeRefusal', () => {
	it('renames a room and puts a room with no subrooms under another', () => {
		expect(changeRefusal(rooms, 'decisions', fields('Decisions'))).toBeNull();
		expect(changeRefusal(rooms, 'decisions', fields('Company decisions', 'ops'))).toBeNull();
	});

	it('keeps the General room named as it is and under nothing, while what it is for may change', () => {
		expect(changeRefusal(rooms, 'general', fields('Everyone'))).toBe(refusals.generalKeepsItsName);
		expect(changeRefusal(rooms, 'general', fields('General', 'ops'))).toBe(refusals.generalSitsUnderNothing);
		expect(
			changeRefusal(rooms, 'general', {
				...fields('General'),
				purpose: 'All of us'
			})
		).toBeNull();
	});

	it('refuses a room under itself, and a room that has subrooms, archived ones among them, under another', () => {
		expect(changeRefusal(rooms, 'decisions', fields('Company decisions', 'decisions'))).toBe(refusals.underItself);
		expect(changeRefusal(rooms, 'ops', fields('Operations', 'decisions'))).toBe(refusals.hasSubrooms);
		expect(changeRefusal(rooms, 'finance', fields('Finance', 'decisions'))).toBe(refusals.hasSubrooms);
	});

	it('refuses an archived room or one that is not there', () => {
		expect(changeRefusal(rooms, 'gone', fields('Gone'))).toBe(refusals.roomNotListed);
		expect(changeRefusal(rooms, 'nowhere', fields('Nowhere'))).toBe(refusals.roomNotListed);
	});
});

describe('archiveRefusal', () => {
	it('archives a room whose subrooms are all archived, or that has none', () => {
		expect(archiveRefusal(rooms, 'finance')).toBeNull();
		expect(archiveRefusal(rooms, 'site')).toBeNull();
	});

	it('never archives the General room', () => {
		expect(archiveRefusal(rooms, 'general')).toBe(refusals.generalIsNeverArchived);
	});

	it('refuses a room that still has subrooms not archived, naming them', () => {
		expect(archiveRefusal(rooms, 'ops')).toBe(
			'Operations still has subrooms that are not archived (Site visits): archive them, or put them under another room, first.'
		);
	});

	it('refuses a room already archived', () => {
		expect(archiveRefusal(rooms, 'gone')).toBe(refusals.roomNotListed);
	});
});
