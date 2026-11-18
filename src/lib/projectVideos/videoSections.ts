import type { VideoDetails } from './projectVideo';

/** One part of the library: its name, the line colour it is drawn in, and its videos in the order they are watched. */
export type VideoSection<Video> = { name: string; lineColour: LineColour; videos: Video[] };

/** The six colours a line on a line map may be drawn in (docs/design/brand.md), so a section reads as one line of stops. */
export const lineColours = ['sky', 'lilac', 'teal', 'peach', 'rose', 'daylight'] as const;

export type LineColour = (typeof lineColours)[number];

type Placed = Pick<VideoDetails, 'section' | 'position' | 'title'>;

/** The videos grouped into their sections: each section in the order of its first video, and each video by its position. */
export function videoSectionsOf<Video extends Placed>(videos: Video[]): VideoSection<Video>[] {
	const ordered = [...videos].sort(byPlaceInLibrary);
	const videosBySection = new Map<string, Video[]>();
	for (const video of ordered) videosBySection.set(video.section, [...(videosBySection.get(video.section) ?? []), video]);
	return [...videosBySection].map(([name, sectionVideos], index) => ({
		name,
		lineColour: lineColours[index % lineColours.length],
		videos: sectionVideos
	}));
}

function byPlaceInLibrary(left: Placed, right: Placed): number {
	if (left.position !== right.position) return left.position - right.position;
	return left.title.localeCompare(right.title);
}
