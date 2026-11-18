import type { VideoLibrary } from './videoLibraries';

/** What a project video is called and where it sits in the library: the words a person reads, the order they watch in and the library it sits in. */
export type VideoDetails = {
	title: string;
	description: string;
	section: string;
	position: number;
	durationSeconds: number | null;
	library: VideoLibrary;
};

/** A file as described before it is sent. */
export type VideoFileGiven = { filename: string; mimeType: string; byteCount: number };

/** A video as it is first described: its words, its film and, if it has them, its thumbnail and its captions. */
export type VideoGiven = { details: VideoDetails; film: VideoFileGiven; thumbnail: VideoFileGiven | null; captions: VideoFileGiven | null };

/** A video kept on a project, once its film has arrived. */
export type ProjectVideo = VideoDetails & {
	id: string;
	projectId: string;
	filename: string;
	mimeType: string;
	byteCount: number;
	storagePath: string;
	thumbnailStoragePath: string | null;
	captionsStoragePath: string | null;
	addedBy: string | null;
	recordedAt: string;
};

/** A kept video with the links the page plays it, shows its thumbnail and reads its captions from. */
export type WatchableVideo = ProjectVideo & { filmUrl: string | null; thumbnailUrl: string | null; captionsUrl: string | null };
