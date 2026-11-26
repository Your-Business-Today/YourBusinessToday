import { afterEach, describe, expect, it, vi } from 'vitest';
import { fileAttachmentAsDocument } from './fileAttachmentAsDocument';
import type { SupabaseClient } from '@supabase/supabase-js';

const grantDocumentUpload = vi.fn();
const recordDocumentUpload = vi.fn();

vi.mock('./keepProjectDocument', () => ({ grantDocumentUpload: (...given: unknown[]) => grantDocumentUpload(...given) }));
vi.mock('./recordDocumentUpload', () => ({ recordDocumentUpload: (...given: unknown[]) => recordDocumentUpload(...given) }));

const wordType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const adder = { owner: { kind: 'project' as const, id: 'project-1' }, accountId: 'account-1' };
const fileBytes = new Blob(['the research']);
const uploadUrl = 'https://files.example/upload';

function storeHolding(bytes: Blob): SupabaseClient {
	const bucket = { download: async () => ({ data: bytes, error: null }) };
	return { storage: { from: () => bucket } } as unknown as SupabaseClient;
}

function attachmentOf(filename: string, mimeType: string) {
	return { id: 'attachment-1', filename, mimeType, byteCount: fileBytes.size, storagePath: `task-1/attachment-1/${filename}` };
}

afterEach(() => {
	vi.unstubAllGlobals();
	vi.clearAllMocks();
});

describe('fileAttachmentAsDocument', () => {
	it('keeps a copy of the file under its own name and sends its bytes to the granted link', async () => {
		const sendFile = vi.fn(async () => new Response(null, { status: 200 }));
		vi.stubGlobal('fetch', sendFile);
		grantDocumentUpload.mockResolvedValue({ documentId: 'document-1', uploadUrl });
		const attachment = attachmentOf('1. Real Estate segment map.docx', wordType);
		const filing = await fileAttachmentAsDocument(storeHolding(fileBytes), adder, attachment, { section: 'Sector research' });
		expect(filing).toEqual({ filename: attachment.filename, documentId: 'document-1' });
		const { calls } = grantDocumentUpload.mock;
		const [, , details, file] = calls[0];
		expect(details).toMatchObject({ title: '1. Real Estate segment map', section: 'Sector research' });
		expect(file).toEqual({ filename: attachment.filename, mimeType: wordType, byteCount: fileBytes.size });
		expect(sendFile).toHaveBeenCalledWith(uploadUrl, expect.objectContaining({ method: 'PUT', body: fileBytes }));
		expect(recordDocumentUpload).toHaveBeenCalledWith(expect.anything(), adder, 'document-1');
	});

	it('refuses by name a file whose type the documents do not keep, and keeps nothing', async () => {
		const attachment = attachmentOf('recording.mp4', 'video/mp4');
		const filing = await fileAttachmentAsDocument(storeHolding(fileBytes), adder, attachment, {});
		expect(filing).toMatchObject({ filename: 'recording.mp4', refusal: expect.stringContaining('mimeType') });
		expect(grantDocumentUpload).not.toHaveBeenCalled();
	});
});
