import { safeStorageFilename } from '$lib/server/storage/safeStorageFilename';

/** The private bucket board papers are kept in (migration 0160). */
export const boardroomPapersBucket = 'boardroom-papers';

/** Where a paper's file is kept: under its organisation and meeting, so a board's papers sit together. */
export function boardroomPaperStoragePath(meeting: { organisationId: string; id: string }, paperId: string, filename: string): string {
	return `${meeting.organisationId}/${meeting.id}/${paperId}/${safeStorageFilename(filename)}`;
}
