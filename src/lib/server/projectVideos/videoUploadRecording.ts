import type { VideoLibrary } from '$lib/projectVideos/videoLibraries';
import { uploadRecordings, type UploadRecording } from '$lib/server/storage/recordArrivedUpload';

/** The files that may come with a film, and whether each arrived. */
export type CompanionsArrived = { hasThumbnail: boolean; hasCaptions: boolean };

/** What recording a video found — with which of its companions came too — or that no upload of that id was granted to this person here. */
export type VideoUploadRecording =
	| Exclude<UploadRecording, { status: 'recorded' }>
	| ({ status: 'recorded'; byteCount: number; library: VideoLibrary } & CompanionsArrived)
	| { status: 'not_granted' };

export const videoUploadRecordings = { ...uploadRecordings, notGranted: 'not_granted' } as const;
