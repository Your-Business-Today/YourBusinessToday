const megabyte = 1024 * 1024;

/** The limits of a project video's own columns and of its bucket (migration 0266), read by every door that adds or changes one. */
export const VideoLimits = {
	longestTitle: 120,
	longestDescription: 2000,
	longestSection: 80,
	longestFilename: 255,
	largestByteCount: 50 * megabyte,
	largestMegabytes: 50,
	largestThumbnailByteCount: 5 * megabyte,
	largestThumbnailMegabytes: 5,
	largestCaptionsByteCount: megabyte,
	largestCaptionsMegabytes: 1,
	highestPosition: 9999,
	longestDurationSeconds: 36000,
	mostVideosListed: 200
} as const;

/** The film files a project video plays: what a browser plays in a video element without a plug-in. */
export const videoFileTypes = ['video/mp4', 'video/webm', 'video/quicktime'] as const;

/** The pictures a project video's thumbnail may be. */
export const thumbnailTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;

/** The captions a project video may carry: WebVTT, which a video element reads as a track. */
export const captionsTypes = ['text/vtt'] as const;

/** Storage keeps a signed upload link open for two hours, and the grant says so. */
export const videoUploadLinkLifetimeHours = 2;

/** A video on the library page stays playable for three hours after the page is opened. */
export const videoViewLinkLifetimeSeconds = 3 * 60 * 60;
