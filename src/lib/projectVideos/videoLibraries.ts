/** A project keeps its videos in two libraries: tutorials that teach its people how to use what was built, and promotional films that show it off. */
export const VideoLibraries = { tutorials: 'tutorials', promotional: 'promotional' } as const;

export type VideoLibrary = (typeof VideoLibraries)[keyof typeof VideoLibraries];

export const videoLibraryNames: VideoLibrary[] = Object.values(VideoLibraries);

type LibraryWords = { name: string; videosAre: string; addressSegment: string | null };

/** What each library is called on its page and to a Claude, and the segment its page adds beneath the project's videos. */
export const videoLibraryWords: Record<VideoLibrary, LibraryWords> = {
	tutorials: { name: 'Tutorials', videosAre: 'tutorial videos', addressSegment: null },
	promotional: { name: 'Promotional', videosAre: 'promotional videos', addressSegment: 'promotional' }
};
