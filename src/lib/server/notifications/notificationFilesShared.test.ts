import { describe, expect, it } from 'vitest';
import { parseNotificationRow } from './notificationListItem';

describe('parseNotificationRow, for a chat message that carries files', () => {
	it('reads a chat message of photos alone by what was sent, with no words to quote', () => {
		const item = parseNotificationRow({
			id: 'n4',
			chat_room_id: 'finance',
			chat_rooms: { name: 'Finance', organisation_id: 'jewel' },
			chat_messages: { body: '', author_account_id: 'nigel', chat_message_files: [{ content_type: 'image/jpeg' }, { content_type: 'image/heic' }] },
			is_read: false,
			created_at: '2026-11-22T09:15:00Z'
		});
		expect(item.subjectKind).toBe('room');
		expect(item.messageBody).toBe('');
		expect(item.filesShared).toBe('sent 2 photos');
		expect(item.messageAuthorId).toBe('nigel');
	});

	it('says nothing of files for a message of words alone, or one read before migration 0275', () => {
		const item = parseNotificationRow({
			id: 'n5',
			chat_room_id: 'finance',
			chat_rooms: { name: 'Finance', organisation_id: 'jewel' },
			chat_messages: { body: 'The VAT return is in.', author_account_id: 'nigel' },
			is_read: false,
			created_at: '2026-11-22T09:15:00Z'
		});
		expect(item.messageBody).toBe('The VAT return is in.');
		expect(item.filesShared).toBe('');
	});
});
