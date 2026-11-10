import { mayBePosted, type LibraryItem } from '../library/libraryItem';

/** What a post says of its picture: the photo or video it needs and where that is expected from, and the ones chosen for it. */
export type PostPictures = { needed: string | null; expectedFrom: string | null; chosen: LibraryItem[] };

/**
 * Where a post's picture stands: nobody has said it needs one, it needs one and has none, one is chosen that may be
 * posted, or one chosen has since been marked not to be posted.
 */
export const PictureStandings = {
	noneSaid: 'none_said',
	waiting: 'waiting',
	chosen: 'chosen',
	noLongerPostable: 'no_longer_postable'
} as const;

export type PictureStanding = (typeof PictureStandings)[keyof typeof PictureStandings];

/** A post's picture as the month's plan shows it. */
export type PictureSummary = { standing: PictureStanding; needed: string | null; chosenCount: number };

/** The pictures of a post nobody has said anything about. */
export const noPictures: PostPictures = { needed: null, expectedFrom: null, chosen: [] };

export function pictureStandingOf({ needed, chosen }: PostPictures): PictureStanding {
	const isAnyNotPostable = chosen.some((item) => !mayBePosted(item));
	if (isAnyNotPostable) return PictureStandings.noLongerPostable;
	if (chosen.length > 0) return PictureStandings.chosen;
	if (needed === null) return PictureStandings.noneSaid;
	return PictureStandings.waiting;
}

export function pictureSummaryOf(pictures: PostPictures): PictureSummary {
	const { needed, chosen } = pictures;
	return { standing: pictureStandingOf(pictures), needed, chosenCount: chosen.length };
}

/** Whether an item was chosen for a post now, or had been chosen for it already, so nothing is kept twice. */
export const ChoosingOutcomes = { chosen: 'chosen', alreadyChosen: 'alreadyChosen' } as const;

export type ChoosingOutcome = (typeof ChoosingOutcomes)[keyof typeof ChoosingOutcomes];

/** Whether a post still waits on a picture: it needs one and has none, or the one chosen may no longer be posted. */
export function isAwaitingPicture({ standing }: { standing: PictureStanding }): boolean {
	return standing === PictureStandings.waiting || standing === PictureStandings.noLongerPostable;
}
