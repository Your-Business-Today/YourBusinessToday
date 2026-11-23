import { describe, expect, it } from 'vitest';
import { filesNamedIn } from './organisationExportFileStores';

describe('filesNamedIn', () => {
	it('carries a file whose upload was recorded, and leaves out one that never arrived', () => {
		const rows = [
			{ id: 'paper-1', storage_path: 'jewel/m1/p1/minutes.pdf', recorded_at: '2026-11-01T09:00:00Z' },
			{ id: 'paper-2', storage_path: 'jewel/m1/p2/never.pdf', recorded_at: null }
		];
		expect(filesNamedIn('boardroom_agenda_papers', rows).map((file) => file.storagePath)).toEqual(['jewel/m1/p1/minutes.pdf']);
	});

	it('carries every file said in the chat, whose row is written only once the file has arrived', () => {
		const rows = [{ id: 'f1', storage_path: 'jewel/nigel/u1/slab.jpg' }];
		expect(filesNamedIn('chat_message_files', rows)).toEqual([
			{ bucket: 'chat-files', storagePath: 'jewel/nigel/u1/slab.jpg', exportPath: 'files/chat-files/jewel/nigel/u1/slab.jpg' }
		]);
	});
});
