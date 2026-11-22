import { documentUploadRecordings } from '$lib/server/projectDocuments/recordDocumentUpload';

/** Why a file sent from the page was not kept, by what recording it found; a kept file has none. */
export const recordingRefusals: Record<string, string | undefined> = {
	[documentUploadRecordings.notGranted]: 'That upload was not started here. Choose the file again.',
	[documentUploadRecordings.notArrived]: 'The file never reached storage. Please try again.',
	[documentUploadRecordings.lapsed]: 'The upload took too long. Please try again.',
	[documentUploadRecordings.alreadyRecorded]: undefined,
	[documentUploadRecordings.recorded]: undefined
};
