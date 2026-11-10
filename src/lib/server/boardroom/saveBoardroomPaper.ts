import type { SupabaseClient } from '@supabase/supabase-js';
import { boardroomPapersBucket, boardroomPaperStoragePath } from './boardroomPaperStorage';
import { boardPaperUploadLinkLifetimeHours } from '$lib/data/boardroomPaperRules';
import { boardPaperKinds, type BoardPaperFileGiven } from '$lib/data/boardroomPaper';
import type { BoardroomMeeting } from '$lib/data/boardroomMeeting';

/** Where a paper goes and who adds it: the meeting, the item on its agenda, the director's seat and account. */
export type PaperPlacing = {
	meeting: BoardroomMeeting;
	agendaItemId: string;
	seatId: string;
	addedBy: string;
	title: string;
};

/** The link a file is sent to, and the id its paper is kept under once it arrives. */
export type GrantedPaperUpload = { paperId: string; uploadUrl: string; expiresAt: string };

const millisecondsInAnHour = 60 * 60 * 1000;

function placingColumns(placing: PaperPlacing) {
	const { meeting } = placing;
	return {
		organisation_id: meeting.organisationId,
		meeting_id: meeting.id,
		agenda_item_id: placing.agendaItemId,
		title: placing.title,
		added_by_director_id: placing.seatId,
		added_by: placing.addedBy
	};
}

async function insertPaper(supabase: SupabaseClient, row: Record<string, unknown>): Promise<void> {
	const { error } = await supabase.from('boardroom_agenda_papers').insert(row);
	if (error) throw error;
}

/** Keeps a written note on an agenda item at once, and gives back its paper id. */
export async function insertNotePaper(supabase: SupabaseClient, placing: PaperPlacing, note: string, now: Date): Promise<string> {
	const paperId = crypto.randomUUID();
	const recordedAt = now.toISOString();
	await insertPaper(supabase, { id: paperId, ...placingColumns(placing), kind: boardPaperKinds.note, note, recorded_at: recordedAt });
	return paperId;
}

/** Opens a signed upload link for one file onto an agenda item; the paper is kept once the file arrives. */
export async function grantPaperUpload(
	supabase: SupabaseClient,
	placing: PaperPlacing,
	file: BoardPaperFileGiven,
	now: Date
): Promise<GrantedPaperUpload> {
	const paperId = crypto.randomUUID();
	const storagePath = boardroomPaperStoragePath(placing.meeting, paperId, file.filename);
	const { data: signed, error } = await supabase.storage.from(boardroomPapersBucket).createSignedUploadUrl(storagePath);
	if (error !== null) throw error;
	const expiresAt = new Date(now.getTime() + boardPaperUploadLinkLifetimeHours * millisecondsInAnHour).toISOString();
	const fileColumns = { filename: file.filename, mime_type: file.mimeType, storage_path: storagePath, expires_at: expiresAt };
	await insertPaper(supabase, { id: paperId, ...placingColumns(placing), kind: boardPaperKinds.file, ...fileColumns });
	return { paperId, uploadUrl: signed.signedUrl, expiresAt };
}
