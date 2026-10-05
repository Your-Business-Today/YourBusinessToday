import type { SupabaseClient } from '@supabase/supabase-js';
import { contentKindFor, type AttachmentContentKind } from '$lib/data/taskAttachmentRules';
import {
	fileAnswer,
	imageAnswer,
	linkAnswer,
	pdfAnswer,
	textAnswer,
	type AttachmentAnswer
} from './attachmentAnswers';
import type { McpToolAnswer } from '../mcpContent';
import type { StoredFile } from '$lib/server/projects/attachmentRecord';

const answerByKind: Record<AttachmentContentKind, AttachmentAnswer> = {
	text: textAnswer,
	wordDocument: textAnswer,
	spreadsheet: textAnswer,
	pdf: pdfAnswer,
	image: imageAnswer,
	file: fileAnswer,
	link: linkAnswer
};

/** A stored file as an assistant takes it in: its text, the image itself, the file, or a link. */
export function answerWithStoredFile(
	supabase: SupabaseClient,
	storedFile: StoredFile
): Promise<McpToolAnswer> {
	const answer = answerByKind[contentKindFor(storedFile.mimeType, storedFile.byteCount)];
	return answer(supabase, storedFile);
}
