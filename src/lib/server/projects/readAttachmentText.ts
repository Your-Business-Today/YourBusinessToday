import type { SupabaseClient } from '@supabase/supabase-js';
import { contentKindFor, type AttachmentContentKind } from '$lib/data/taskAttachmentRules';
import { downloadAttachmentFile } from './downloadAttachmentFile';
import { extractPdfText } from '$lib/server/documents/extractPdfText';
import { extractSpreadsheetText } from '$lib/server/documents/extractSpreadsheetText';
import { extractWordDocumentText } from '$lib/server/documents/extractWordDocumentText';
import type { StoredFile } from './attachmentRecord';

export const maxAttachmentTextCharacters = 200_000;

export type AttachmentText = { text: string; isTruncated: boolean };

type TextExtractor = (fileBytes: Uint8Array) => Promise<string>;

const extractorByKind: Partial<Record<AttachmentContentKind, TextExtractor>> = {
	wordDocument: extractWordDocumentText,
	pdf: extractPdfText,
	spreadsheet: extractSpreadsheetText
};

export async function readAttachmentText(
	supabase: SupabaseClient,
	attachment: StoredFile
): Promise<AttachmentText> {
	const fileBytes = await downloadAttachmentFile(supabase, attachment);
	const wholeText = await decode(fileBytes, attachment);
	return {
		text: wholeText.slice(0, maxAttachmentTextCharacters),
		isTruncated: wholeText.length > maxAttachmentTextCharacters
	};
}

async function decode(fileBytes: Uint8Array, attachment: StoredFile): Promise<string> {
	const extract = extractorByKind[contentKindFor(attachment.mimeType, attachment.byteCount)];
	if (extract !== undefined) return extract(fileBytes);
	return new TextDecoder().decode(fileBytes);
}
