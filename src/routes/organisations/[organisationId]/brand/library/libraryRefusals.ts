import { noBrandYet } from '$lib/components/brand/brandLibraryPageWords';
import { libraryUploadLinkLifetimeHours } from '$lib/brand/library/libraryLimits';
import { libraryUploadRecordings, type LibraryUploadRecording } from '$lib/server/brandLibrary/recordLibraryUpload';

/** The site's words when a photo or video could not be added: each says what to do next. */
export const libraryRefusals = {
	noBrandYet,
	noItemGiven: 'A photo or video to add is required.',
	notGranted: 'That upload was not started from this page — please add the file again.',
	notArrived: 'The file never reached storage — please try again.',
	lapsed: `That took longer than ${libraryUploadLinkLifetimeHours} hours, so it was let go — please add the file again.`
} as const;

const refusalsByStatus: Record<string, string> = {
	[libraryUploadRecordings.notGranted]: libraryRefusals.notGranted,
	[libraryUploadRecordings.notArrived]: libraryRefusals.notArrived,
	[libraryUploadRecordings.lapsed]: libraryRefusals.lapsed
};

/** Why a file a person sent did not join the library, in words for them, or null when it did or already had. */
export function libraryRecordingRefusal(recording: LibraryUploadRecording): string | null {
	return refusalsByStatus[recording.status] ?? null;
}

/** A check's clause as a sentence the form shows: "Not added: shows is empty." */
export function notAddedBecause(problem: string): string {
	return `Not added: ${problem}.`;
}
