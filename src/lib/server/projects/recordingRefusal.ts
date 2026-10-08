import { uploadLinkLifetimeMinutes } from './uploadGrantRecord';
import { uploadRecordingStatuses, type GrantedUploadRecording } from './recordGrantedUpload';

const refusalsByStatus: Record<string, string> = {
	[uploadRecordingStatuses.fileMissing]: 'The file never reached storage — please try again.',
	[uploadRecordingStatuses.expired]:
		`That took longer than ${uploadLinkLifetimeMinutes} minutes, so it was let go — please send the file again.`,
	[uploadRecordingStatuses.used]: 'That file is already on the task.'
};

/** Why a file a person sent did not become an attachment, in words for them — null when it did. */
export function recordingRefusal(recording: GrantedUploadRecording): string | null {
	return refusalsByStatus[recording.status] ?? null;
}
