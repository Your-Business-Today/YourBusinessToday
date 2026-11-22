import { documentHref } from '../documents/documentAddress';
import { libraryMatchKinds, type LibraryMatch, type LibraryMatchKind } from '$lib/projectLibrary/libraryMatch';
import { VideoLibraries } from '$lib/projectVideos/videoLibraries';
import { videoLibraryHref } from '../videos/videoLibraryAddress';
import { videoQueryKeys } from '../videos/videoWatching';

/** Where a match is opened: a video on screen in its library, a document to read. */
export function libraryMatchHref(match: LibraryMatch): string {
	if (match.kind === libraryMatchKinds.document) return documentHref(match);
	const libraryHref = videoLibraryHref(match.projectId, match.library ?? VideoLibraries.tutorials);
	return `${libraryHref}?${videoQueryKeys.watch}=${encodeURIComponent(match.id)}`;
}

/** What a match is called beside its title. */
export const libraryMatchKindWords: Record<LibraryMatchKind, string> = { video: 'Video', document: 'Document' };
