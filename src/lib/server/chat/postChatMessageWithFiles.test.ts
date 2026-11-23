import { beforeEach, describe, expect, it, vi } from 'vitest';
import { postChatMessage } from './postChatMessage';
import { chatFileStoragePath, isSentBy } from './chatFileBucket';
import { chatFileRefusals, fileKindRefusal, fileNotArrivedRefusal, fileTooLargeRefusal, chatFileLimits } from '$lib/data/chat/chatFileRules';
import type { SupabaseClient } from '@supabase/supabase-js';

const finance = { id: 'finance', name: 'Finance', purpose: '', parentRoomId: null, isGeneral: false, isArchived: false };
vi.mock('./readChatRooms', () => ({ readChatRooms: async () => [finance] }));

const nigel = { organisationId: 'jewel', accountId: 'nigel', postedVia: 'site' as const };
const slabPath = chatFileStoragePath(nigel, 'slab photo.jpg');
const slab = { storagePath: slabPath, fileName: 'slab photo.jpg' };
const messageRow = { id: 'm1', room_id: 'finance', author_account_id: 'nigel', body: '', posted_via: 'site', created_at: '2026-11-22T09:00:00Z' };
const fileRow = { id: 'f1', message_id: 'm1', storage_path: slabPath, file_name: 'slab photo.jpg', content_type: 'image/jpeg', size_bytes: 2048 };

type FileAsKept = { size: number; contentType: string } | null;
type DatabaseRefusal = { code?: string; message: string } | null;

const postingWithFiles = 'post_chat_message_with_files';
const notFound = { data: null, error: { message: 'Object not found' } };

function serviceRoleStoring(kept: FileAsKept, refusal: DatabaseRefusal = null) {
	const inspecting = vi.fn(async () => (kept === null ? notFound : { data: kept, error: null }));
	const files = { select: () => files, in: () => files, order: async () => ({ data: [fileRow], error: null }) };
	const calling = vi.fn(async (name: string) => {
		const isPosting = name === postingWithFiles;
		if (isPosting && refusal !== null) return { data: null, error: refusal };
		return { data: isPosting ? messageRow : null, error: null };
	});
	return { rpc: calling, inspecting, from: vi.fn(() => files), storage: { from: () => ({ info: inspecting }) } };
}

const asClient = (serviceRole: ReturnType<typeof serviceRoleStoring>) => serviceRole as unknown as SupabaseClient;

describe('postChatMessage with files', () => {
	beforeEach(() => vi.clearAllMocks());

	it('writes photos with no words in one step, as storage measured them, and moves the author’s place', async () => {
		const serviceRole = serviceRoleStoring({ size: 2048, contentType: 'image/jpeg' });
		const posted = await postChatMessage(asClient(serviceRole), nigel, 'finance', { body: '', files: JSON.stringify([slab]) });
		expect(serviceRole.rpc).toHaveBeenCalledWith(postingWithFiles, {
			organisation: 'jewel',
			room: 'finance',
			author: 'nigel',
			words: '',
			via: 'site',
			files: [{ storage_path: slabPath, file_name: 'slab photo.jpg', content_type: 'image/jpeg', size_bytes: 2048 }]
		});
		expect(serviceRole.rpc).toHaveBeenCalledWith('mark_chat_room_read', { reader: 'nigel', room: 'finance' });
		expect(typeof posted !== 'string' && posted.files).toEqual([{ id: 'f1', storagePath: slabPath, fileName: 'slab photo.jpg', contentType: 'image/jpeg', sizeBytes: 2048 }]);
	});

	it('refuses a file by its size and kind as stored, whatever the browser said, and writes nothing', async () => {
		const tooLarge = serviceRoleStoring({ size: chatFileLimits.largestSizeBytes + 1, contentType: 'image/jpeg' });
		expect(await postChatMessage(asClient(tooLarge), nigel, 'finance', { files: [slab] })).toBe(fileTooLargeRefusal('slab photo.jpg'));
		const wrongKind = serviceRoleStoring({ size: 2048, contentType: 'text/html' });
		expect(await postChatMessage(asClient(wrongKind), nigel, 'finance', { files: [slab] })).toBe(fileKindRefusal('slab photo.jpg'));
		expect(tooLarge.rpc).not.toHaveBeenCalled();
		expect(wrongKind.rpc).not.toHaveBeenCalled();
	});

	it('refuses a file that never arrived, one sent by someone else, and one already on a message', async () => {
		const nothingThere = serviceRoleStoring(null);
		expect(await postChatMessage(asClient(nothingThere), nigel, 'finance', { files: [slab] })).toBe(fileNotArrivedRefusal('slab photo.jpg'));
		const jamesPath = chatFileStoragePath({ organisationId: 'jewel', accountId: 'james' }, 'slab photo.jpg');
		const arrived = serviceRoleStoring({ size: 2048, contentType: 'image/jpeg' });
		expect(await postChatMessage(asClient(arrived), nigel, 'finance', { files: [{ ...slab, storagePath: jamesPath }] })).toBe(chatFileRefusals.notSentHere);
		expect(arrived.inspecting).not.toHaveBeenCalled();
		const taken = serviceRoleStoring({ size: 2048, contentType: 'image/jpeg' }, { code: '23505', message: 'duplicate key' });
		expect(await postChatMessage(asClient(taken), nigel, 'finance', { files: [slab] })).toBe(chatFileRefusals.alreadyOnAMessage);
		expect(taken.rpc).not.toHaveBeenCalledWith('mark_chat_room_read', expect.anything());
	});
});

describe('isSentBy', () => {
	it('takes only a path the site granted this sender, in this organisation, for a file of that name', () => {
		expect(isSentBy(slabPath, nigel, 'slab photo.jpg')).toBe(true);
		expect(isSentBy(slabPath, nigel, 'another.jpg')).toBe(false);
		expect(isSentBy(slabPath, { organisationId: 'elsewhere', accountId: 'nigel' }, 'slab photo.jpg')).toBe(false);
		expect(isSentBy('jewel/nigel/not-an-id/slab-photo.jpg', nigel, 'slab photo.jpg')).toBe(false);
		expect(isSentBy(`${slabPath}/beyond`, nigel, 'slab photo.jpg')).toBe(false);
	});
});
