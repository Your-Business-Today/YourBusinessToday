import type { LibraryItem } from '../library/libraryItem';
import { pictureStandingOf, type PictureStanding, type PostPictures } from '../pictures/postPictures';

/** A picture chosen for a post as the page shows it: what it shows, its posting footing, and the link it is viewed by, if storage signed one. */
export type ChosenPictureRow = Pick<LibraryItem, 'id' | 'filename' | 'mimeType' | 'shows' | 'posting' | 'permissionGivenBy'> & {
	viewUrl: string | null;
};

/** What a post says of its picture, beside its caption: the photo or video it needs, where from, and the ones chosen. */
export type PostPicturesPage = {
	needed: string | null;
	expectedFrom: string | null;
	standing: PictureStanding;
	chosen: ChosenPictureRow[];
	chosenCount: number;
};

/** Each chosen item with the link storage signed for it, in the order they were chosen. */
export type SignedPictures = (LibraryItem & { viewUrl: string | null })[];

export function postPicturesPageOf(pictures: PostPictures, signed: SignedPictures): PostPicturesPage {
	const { needed, expectedFrom } = pictures;
	const standing = pictureStandingOf(pictures);
	return { needed, expectedFrom, standing, chosen: signed.map(chosenPictureRowOf), chosenCount: signed.length };
}

function chosenPictureRowOf(item: SignedPictures[number]): ChosenPictureRow {
	const { id, filename, mimeType, shows, posting, permissionGivenBy, viewUrl } = item;
	return { id, filename, mimeType, shows, posting, permissionGivenBy, viewUrl };
}
