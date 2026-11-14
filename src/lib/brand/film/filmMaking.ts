import { isVideoMedium } from '../content/checkMusicItemId';
import { problemWithDraftItems } from '../content/checkDraftItems';
import { OrderKinds } from './filmOrder';
import type { ContentPiece } from '../content/contentPiece';
import type { ItemStanding } from '../library/choosableItem';

/** Where a request for a piece's video stands: asked for, on the runner, in the library, or failed. */
export const FilmMakingStates = {
	waiting: 'waiting',
	filming: 'filming',
	ready: 'ready',
	failed: 'failed'
} as const;

export type FilmMakingState = (typeof FilmMakingStates)[keyof typeof FilmMakingStates];

/** What a request makes: one MP4 of a video piece, or one PNG a shot of a picture piece. */
export const FilmMakingKinds = OrderKinds;

export type FilmMakingKind = (typeof FilmMakingKinds)[keyof typeof FilmMakingKinds];

export function isFilmMakingKind(candidate: unknown): candidate is FilmMakingKind {
	return Object.values(FilmMakingKinds).some((kind) => kind === candidate);
}

/** One request for a piece's video or pictures, as the piece's page and read_content show it, with every picture it made in shot order. */
export type FilmMaking = {
	id: string;
	kind: FilmMakingKind;
	state: FilmMakingState;
	pictureItemIds: string[];
	failureReason: string | null;
	libraryItemId: string | null;
	askedAt: string;
	finishedAt: string | null;
};

/** The limits of a request's own columns (migration 0233). */
export const FilmMakingLimits = { failureReasonCharacters: 500 } as const;

export const firstShotNumber = 1;

/** Whether the request is still to finish: waiting for the runner, or on it. */
export function isFilmMakingOpen(making: FilmMaking | null): boolean {
	if (making === null) return false;
	return making.state === FilmMakingStates.waiting || making.state === FilmMakingStates.filming;
}

/** Why the piece cannot be made into its video now, or null: a video with shots, each with a clip that may go out, and none being made. */
export function problemWithMakingFilm(piece: ContentPiece, items: Map<string, ItemStanding>, latest: FilmMaking | null): string | null {
	if (!isVideoMedium({ path: piece.mediumPath })) return `“${piece.title}” is not a video, so there is no film to make`;
	const { storyboard } = piece;
	if (storyboard.length === 0) return `“${piece.title}” has no storyboard yet; give it shots with draft_content`;
	const shotWithoutClip = storyboard.findIndex((shot) => shot.clipItemId === null);
	if (shotWithoutClip >= 0) return `Shot ${shotWithoutClip + firstShotNumber} has no clip; give it a clipItemId from the library`;
	const itemProblem = problemWithDraftItems(piece, items);
	if (itemProblem !== null) return itemProblem;
	if (isFilmMakingOpen(latest)) return `“${piece.title}” is already being made; its video shows on the piece when it is ready`;
	return null;
}
