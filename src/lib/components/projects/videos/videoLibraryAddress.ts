import { projectHref, projectSegments } from '../projectAddresses';
import { videoLibraryNames, videoLibraryWords, type VideoLibrary } from '$lib/projectVideos/videoLibraries';

/** Where a project's library of videos is watched: the tutorials at the project's videos, the promotional films beneath them. */
export function videoLibraryHref(projectId: string, library: VideoLibrary): string {
	const { addressSegment } = videoLibraryWords[library];
	const videosHref = projectHref(projectId, projectSegments.videos);
	if (addressSegment === null) return videosHref;
	return `${videosHref}/${addressSegment}`;
}

const libraryOfSegment = new Map(videoLibraryNames.map((library) => [videoLibraryWords[library].addressSegment, library]));

/** The library a videos page shows, from the segment beneath the project's videos; none when the segment names no library. */
export function videoLibraryAt(segment: string | undefined): VideoLibrary | null {
	return libraryOfSegment.get(segment ?? null) ?? null;
}
