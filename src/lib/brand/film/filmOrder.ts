import type { FilmShape } from './filmFrame';
import type { ShotWordPlace } from '../content/contentPiece';

/** What a request makes: one MP4, or one PNG a shot. */
export const OrderKinds = { video: 'video', pictures: 'pictures' } as const;

/** A shot's three lines and where they sit, as the film draws them. */
export type ShotWords = {
	overline: string;
	headline: string;
	underline: string;
	wordsAt: ShotWordPlace;
};

/** A library file the recipe fetches: its short-lived link and the name it is saved under. */
export type OrderFile = { url: string; filename: string };

/** One shot as the video lays it in: how long, the clip it shows (a video played or a photo held), and its words. */
export type FilmOrderShot = {
	seconds: number;
	clip: OrderFile;
	isVideo: boolean;
	words: ShotWords;
};

/**
 * A video for the user's Claude to make: the footage and music laid under the words, in the frame's shape and the brand's
 * look, sent to the link the MP4 goes to in the brand's library, which keeps nothing larger than largestByteCount.
 */
export type VideoOrder = {
	kind: typeof OrderKinds.video;
	shape: FilmShape;
	look: Record<string, string>;
	uploadUrl: string;
	largestByteCount: number;
	shots: FilmOrderShot[];
	music: OrderFile | null;
};

/** One picture to make: the photo it is made from, its words, and the link its PNG is sent to. */
export type PictureOrderShot = {
	photo: OrderFile;
	words: ShotWords;
	uploadUrl: string;
};

/** Pictures for the user's Claude to make, one a shot in shot order, each with its shot's words over it. */
export type PictureOrder = {
	kind: typeof OrderKinds.pictures;
	shape: FilmShape;
	look: Record<string, string>;
	largestByteCount: number;
	pictures: PictureOrderShot[];
};

export type FilmOrder = VideoOrder | PictureOrder;

/** What the user's Claude says when it is done: everything arrived at its link, or why it was not made. */
export type FilmOutcome = { hasArrived: true } | { hasArrived: false; failureReason: string };
