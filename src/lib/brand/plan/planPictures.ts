import { isAwaitingPicture, noPictures, pictureSummaryOf, type PictureSummary, type PostPictures } from '../pictures/postPictures';
import type { PlanEntry } from './contentPlan';

/** What each post of the month says of its picture, by post id; a post nobody has said anything of is left out. */
export type PlanPictures = Map<string, PostPictures>;

export function pictureOfPost(pictures: PlanPictures, postId: string): PictureSummary {
	return pictureSummaryOf(pictures.get(postId) ?? noPictures);
}

/** How many of the month's posts still wait on a picture, each post counted once however many channels it goes out on. */
export function awaitingPictureCountOf(entries: PlanEntry[], pictures: PlanPictures): number {
	const postIds = [...new Set(entries.map((entry) => entry.postId))];
	return postIds.filter((postId) => isAwaitingPicture(pictureOfPost(pictures, postId))).length;
}
