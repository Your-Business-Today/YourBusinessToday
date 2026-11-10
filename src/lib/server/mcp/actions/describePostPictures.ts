import { describePostingFooting } from '$lib/brand/library/libraryWords';
import { mayBePosted, type LibraryItem } from '$lib/brand/library/libraryItem';
import { PictureStandings, pictureStandingOf, type PictureStanding, type PostPictures } from '$lib/brand/pictures/postPictures';

/** The actions on a post's picture, named wherever the connector reads one out. */
export const PictureActions = {
	sayNeeded: 'say_post_picture_needed',
	choose: 'choose_post_picture',
	listAwaiting: 'list_posts_awaiting_picture'
} as const;

const notPostableMark = ' [marked not to be posted since it was chosen: choose another]';

/** What a post says of its picture, as read_content gives it: what it needs, where from, and each item chosen. */
export function describePostPictures(pictures: PostPictures): string {
	const { needed, expectedFrom, chosen } = pictures;
	const neededLine = needed === null ? `Picture: nobody has said what this post needs; ${PictureActions.sayNeeded} says it.` : `Picture needed: ${needed}`;
	const sourceLines = expectedFrom === null ? [] : [`Expected from: ${expectedFrom}`];
	const chosenLines = chosen.length === 0 ? [noneChosenLine(pictureStandingOf(pictures))] : ['Chosen from the library:', ...chosen.map(chosenLine)];
	return [neededLine, ...sourceLines, ...chosenLines].join('\n');
}

function noneChosenLine(standing: PictureStanding): string {
	const waiting = standing === PictureStandings.waiting ? 'it is waiting on a picture. ' : '';
	return `No picture chosen yet: ${waiting}${PictureActions.choose} chooses one from list_brand_library.`;
}

function chosenLine(item: LibraryItem): string {
	const mark = mayBePosted(item) ? '' : notPostableMark;
	return `- ${item.filename} (item id ${item.id}): ${item.shows} — ${describePostingFooting(item)}${mark}`;
}

const pictureMarks: Record<PictureStanding, string> = {
	[PictureStandings.noneSaid]: '',
	[PictureStandings.waiting]: ' [waiting on a picture]',
	[PictureStandings.chosen]: ' [picture chosen]',
	[PictureStandings.noLongerPostable]: ' [its picture may no longer be posted]'
};

/** The mark a post carries on the plan for where its picture stands; nothing while nobody has said it needs one. */
export function pictureMarkOf({ standing }: { standing: PictureStanding }): string {
	return pictureMarks[standing];
}
