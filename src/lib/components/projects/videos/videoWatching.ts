import type { VideoSection } from '$lib/projectVideos/videoSections';
import type { WatchableVideo } from '$lib/projectVideos/projectVideo';

/** What the address names in the library: the video on screen. */
export const videoQueryKeys = { watch: 'watch' } as const;

/** The video on screen, the section it sits in, and the one that plays after it, if any. */
export type NowWatching = { video: WatchableVideo; section: VideoSection<WatchableVideo>; nextVideo: WatchableVideo | null };

/** The address that puts a video on screen. */
export function watchHref(video: WatchableVideo): string {
	return `?${videoQueryKeys.watch}=${encodeURIComponent(video.id)}`;
}

/** The video the address names, found in its section, with the one after it on the same line or the first of the next line. */
export function nowWatching(sections: VideoSection<WatchableVideo>[], videoId: string | null): NowWatching | null {
	if (videoId === null) return null;
	const sectionIndex = sections.findIndex((section) => section.videos.some((video) => video.id === videoId));
	if (sectionIndex === -1) return null;
	const section = sections[sectionIndex];
	const stopIndex = section.videos.findIndex((video) => video.id === videoId);
	const nextOnLine = section.videos[stopIndex + 1];
	const firstOfNextLine = sections[sectionIndex + 1]?.videos[0];
	return { video: section.videos[stopIndex], section, nextVideo: nextOnLine ?? firstOfNextLine ?? null };
}

/** How long a section runs in all, in seconds, counting only the videos whose length is known. */
export function sectionRunningSeconds(section: VideoSection<WatchableVideo>): number | null {
	const known = section.videos.flatMap((video) => (video.durationSeconds === null ? [] : [video.durationSeconds]));
	if (known.length === 0) return null;
	return known.reduce((total, seconds) => total + seconds, 0);
}
