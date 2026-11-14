/** One shot as the runner lays it in: how long, and the clip it shows, a video played or a photo held. */
export type FilmOrderShot = { seconds: number; clipUrl: string; isVideo: boolean };

/**
 * What the site tells GitHub's runner to film: the page that draws the words, the footage and music laid under them,
 * and the link the MP4 is sent to in the brand's library, which keeps nothing larger than largestByteCount.
 */
export type FilmOrder = {
	filmPagePath: string;
	uploadUrl: string;
	largestByteCount: number;
	shots: FilmOrderShot[];
	musicUrl: string | null;
};

/** What the runner says when it is done: the video arrived at its link, or why it was not made. */
export type FilmOutcome = { hasArrived: true } | { hasArrived: false; failureReason: string };
