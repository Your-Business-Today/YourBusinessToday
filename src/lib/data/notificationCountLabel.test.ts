import { describe, expect, it } from 'vitest';
import { notificationCountLabel } from './notificationCountLabel';

describe('notificationCountLabel', () => {
	it('counts the unread while any are unread', () => {
		expect(notificationCountLabel(3, 5)).toBe('3 unread messages');
		expect(notificationCountLabel(1, 5)).toBe('1 unread message');
	});

	it('counts them all once they are read', () => {
		expect(notificationCountLabel(0, 4)).toBe('4 messages');
	});

	it('says nothing of a single read notification', () => {
		expect(notificationCountLabel(0, 1)).toBe('');
	});
});
