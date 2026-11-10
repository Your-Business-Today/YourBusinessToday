import type { SupabaseClient } from '@supabase/supabase-js';
import { boardroomPapersBucket } from './boardroomPaperStorage';
import { getBoardroomPaper } from './getBoardroomPapers';
import { claimArrivedFile } from '$lib/server/storage/claimArrivedFile';
import { measureStoredFile } from '$lib/server/storage/measureStoredFile';
import { hasExpired } from '$lib/data/expiry';
import { boardPaperRefusals } from '$lib/data/boardroomPaperRules';
import { isFilePaper, type BoardroomFilePaper } from '$lib/data/boardroomPaper';
import { filePaperRecorded, paperAlreadyRecorded, paperLinkLapsed, paperNotArrived } from '$lib/data/describeBoardroomPaper';
import type { MeetingCaller } from './callBoardroomMeeting';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

async function recordArrival(supabase: SupabaseClient, paper: BoardroomFilePaper, now: Date): Promise<string> {
	const byteCount = await measureStoredFile(supabase, boardroomPapersBucket, paper.storagePath);
	if (byteCount === null) return hasExpired(paper.expiresAt ?? paper.createdAt, now) ? paperLinkLapsed : paperNotArrived;
	const isClaimed = await claimArrivedFile(supabase, 'boardroom_agenda_papers', paper.id, byteCount, now);
	if (!isClaimed) return paperAlreadyRecorded(paper);
	return filePaperRecorded(paper, byteCount);
}

/**
 * Keep the file that arrived at a link this director was granted, at the size that actually arrived.
 * A file that arrived is always kept, however late it is recorded; nothing here deletes one.
 */
export async function recordBoardroomPaperUpload(
	supabase: SupabaseClient,
	organisation: Organisation,
	paperId: string,
	caller: MeetingCaller
): Promise<string> {
	const paper = await getBoardroomPaper(supabase, organisation.id, paperId);
	const isTheirs = paper !== null && paper.addedBy === caller.accountId;
	if (!isTheirs || !isFilePaper(paper)) return boardPaperRefusals.noSuchUpload;
	if (paper.recordedAt !== null) return paperAlreadyRecorded(paper);
	return recordArrival(supabase, paper, caller.now);
}
