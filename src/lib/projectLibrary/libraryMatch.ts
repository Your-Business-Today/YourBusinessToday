import type { VideoLibrary } from '$lib/projectVideos/videoLibraries';

/** What a match in a project's library is: one of its videos or one of its documents. */
export const libraryMatchKinds = { video: 'video', document: 'document' } as const;

export type LibraryMatchKind = (typeof libraryMatchKinds)[keyof typeof libraryMatchKinds];

/** A piece of an excerpt: words as written, or the words the search matched. */
export type ExcerptPart = { words: string; isMatch: boolean };

/** A video or document that matches a search, best first, with the words around the match. */
export type LibraryMatch = {
	kind: LibraryMatchKind;
	id: string;
	projectId: string;
	title: string;
	summary: string;
	section: string;
	library: VideoLibrary | null;
	excerpt: ExcerptPart[];
};

/** The limits of a search: the most words it reads and the most matches it gives back. */
export const LibrarySearchLimits = { longestWords: 200, mostMatches: 20 } as const;

/** The query key a search names its words by, on the Videos and Documents pages alike. */
export const librarySearchQueryKey = 'words';

/** A search a Videos or Documents page was asked for: the words as typed, what matches them, and why they were refused if they were. */
export type LibrarySearch = { words: string; matches: LibraryMatch[]; refusal: string | null };
