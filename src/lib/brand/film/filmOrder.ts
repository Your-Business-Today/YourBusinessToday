/** What a request makes, as the site and the runner both name it: one MP4, or one PNG a shot. */
export const OrderKinds = { video: 'video', pictures: 'pictures' } as const;

/** One shot as the runner lays it in: how long, and the clip it shows, a video played or a photo held. */
export type FilmOrderShot = { seconds: number; clipUrl: string; isVideo: boolean };

/**
 * A video for the runner to film: the page that draws the words, the footage and music laid under them, and the link the
 * MP4 is sent to in the brand's library, which keeps nothing larger than largestByteCount.
 */
export type VideoOrder = {
	kind: typeof OrderKinds.video;
	filmPagePath: string;
	uploadUrl: string;
	largestByteCount: number;
	shots: FilmOrderShot[];
	musicUrl: string | null;
};

/** One picture for the runner to make: the photo it is made from, and the link its PNG is sent to. */
export type PictureOrderShot = { clipUrl: string; uploadUrl: string };

/** Pictures for the runner to make, one a shot in shot order, each drawn with its shot's words from the page. */
export type PictureOrder = { kind: typeof OrderKinds.pictures; filmPagePath: string; largestByteCount: number; pictures: PictureOrderShot[] };

/** What the site tells GitHub's runner to make. */
export type FilmOrder = VideoOrder | PictureOrder;

/** What the runner says when it is done: everything arrived at its link, or why it was not made. */
export type FilmOutcome = { hasArrived: true } | { hasArrived: false; failureReason: string };
