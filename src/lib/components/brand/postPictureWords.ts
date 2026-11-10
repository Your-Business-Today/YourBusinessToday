import { PictureStandings, type PictureStanding } from '$lib/brand/pictures/postPictures';
import type { BadgeTone } from '$lib/components/site/badgeTones';

/** The words the plan and the page of a post use for its picture. */
export const pictureColumn = 'Picture';

export const pictureNotSaid = 'Not said';

export const picturePanelTitle = 'Picture';

export const pictureExplained =
	'Said once for the post and shown on every channel. Your Claude says what picture a post needs and chooses one from ' +
	'the brand’s photos and videos through the Your Business Today connector; an item marked not to be posted is never chosen.';

export const noPictureNeedSaid = 'Nobody has said what picture this post needs yet.';

export const noLongerPostableExplained =
	'A picture chosen for this post has since been marked not to be posted. It stays on the post so the change shows; choose another.';

const oneChosen = 1;

/** The badge that says at a glance where a post's picture stands, or null when nobody has said it needs one. */
export function pictureBadgeOf(standing: PictureStanding, chosenCount: number): { label: string; tone: BadgeTone } | null {
	if (standing === PictureStandings.noneSaid) return null;
	if (standing === PictureStandings.waiting) return { label: 'Waiting on a picture', tone: 'warning' };
	if (standing === PictureStandings.noLongerPostable) return { label: 'May no longer be posted', tone: 'negative' };
	return { label: chosenCount === oneChosen ? 'Picture chosen' : `${chosenCount} pictures chosen`, tone: 'positive' };
}
