import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { spreadsheetMimeType } from '$lib/data/officeMimeTypes';
import type { StoredFile } from '$lib/server/projects/attachmentRecord';
import { answerWithStoredFile } from './storedFileAnswer';

const signedLink = 'https://files.example/door-schedule.xlsx?token=signed';

vi.mock('$lib/server/projects/downloadAttachmentFile', () => ({
	downloadAttachmentFile: async () => new TextEncoder().encode('an old .xls, or a damaged file')
}));

vi.mock('$lib/server/projects/signAttachmentLink', () => ({
	agentFetchLifetimeSeconds: 600,
	signAttachmentLink: async () => signedLink
}));

const unreadableSpreadsheet: StoredFile = {
	id: 'attachment-1',
	storagePath: 'tasks/attachment-1',
	filename: 'door-schedule.xlsx',
	mimeType: spreadsheetMimeType,
	byteCount: 30
};

describe('answerWithStoredFile', () => {
	it('names a spreadsheet whose cells cannot be read, says why, and links the file', async () => {
		const supabase = {} as SupabaseClient;
		const answer = await answerWithStoredFile(supabase, unreadableSpreadsheet);
		expect(answer).toContain('door-schedule.xlsx');
		expect(answer).toContain('Its cells cannot be read');
		expect(answer).toContain(signedLink);
	});
});
