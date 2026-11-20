import type { SupabaseClient } from '@supabase/supabase-js';
import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { downloadAttachmentFile } from '$lib/server/projects/downloadAttachmentFile';
import { fileBlock, imageBlock, textBlock, type McpToolAnswer } from '../mcpContent';
import {
	maxAttachmentTextCharacters,
	readAttachmentText,
	type AttachmentText
} from '$lib/server/projects/readAttachmentText';
import {
	agentFetchLifetimeSeconds,
	signAttachmentLink
} from '$lib/server/projects/signAttachmentLink';
import type { StoredFile } from '$lib/server/projects/attachmentRecord';
import { UnreadableWorkbook } from '$lib/server/documents/extractSpreadsheetText';

export type AttachmentAnswer = (
	supabase: SupabaseClient,
	attachment: StoredFile
) => Promise<McpToolAnswer>;

export const characterCap = maxAttachmentTextCharacters.toLocaleString('en-GB');

const noTextLayer = 'This PDF has no text layer — it is probably a scan.';
const unreadableWorkbook =
	'Its cells cannot be read: it is not an .xlsx workbook, or it is damaged (an old .xls saved under the .xlsx type is the usual cause).';

export const textAnswer: AttachmentAnswer = async (supabase, attachment) =>
	textOf(attachment, await readAttachmentText(supabase, attachment));

export const pdfAnswer: AttachmentAnswer = async (supabase, attachment) => {
	const attachmentText = await readAttachmentText(supabase, attachment);
	if (attachmentText.text === '') return linkAnswerBecause(supabase, attachment, noTextLayer);
	return textOf(attachment, attachmentText);
};

export const spreadsheetAnswer: AttachmentAnswer = async (supabase, attachment) => {
	try {
		return await textAnswer(supabase, attachment);
	} catch (error) {
		if (!(error instanceof UnreadableWorkbook)) throw error;
		return linkAnswerBecause(supabase, attachment, unreadableWorkbook);
	}
};

export const imageAnswer: AttachmentAnswer = async (supabase, attachment) => {
	const fileBytes = await downloadAttachmentFile(supabase, attachment);
	return [textBlock(heading(attachment)), imageBlock(fileBytes, attachment.mimeType)];
};

export const fileAnswer: AttachmentAnswer = async (supabase, attachment) => {
	const fileBytes = await downloadAttachmentFile(supabase, attachment);
	return [
		textBlock(`${heading(attachment)}, ${attachment.mimeType}`),
		fileBlock(attachmentUri(attachment), attachment.mimeType, fileBytes)
	];
};

export const linkAnswer: AttachmentAnswer = (supabase, attachment) =>
	linkAnswerBecause(supabase, attachment, 'It is too big to carry in this answer.');

async function linkAnswerBecause(
	supabase: SupabaseClient,
	attachment: StoredFile,
	reason: string
): Promise<string> {
	const link = await signAttachmentLink(
		supabase,
		attachment,
		'download',
		agentFetchLifetimeSeconds
	);
	return `${heading(attachment)}, ${attachment.mimeType}. ${reason} Fetch it within ten minutes from:\n${link}`;
}

function textOf(attachment: StoredFile, { text, isTruncated }: AttachmentText): string {
	const ending = isTruncated ? `\n\n[cut off at ${characterCap} characters]` : '';
	return `${heading(attachment)}:\n\n${text}${ending}`;
}

function heading(attachment: StoredFile): string {
	return `${attachment.filename} (${describeByteCount(attachment.byteCount)})`;
}

function attachmentUri(attachment: StoredFile): string {
	return `ybt://task-attachments/${attachment.id}/${encodeURIComponent(attachment.filename)}`;
}
