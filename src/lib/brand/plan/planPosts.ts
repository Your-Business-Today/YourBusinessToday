import { pictureOfPost, type PlanPictures } from './planPictures';
import type { PictureSummary } from '../pictures/postPictures';
import type { PlanEntry } from './contentPlan';

/**
 * One post on its day of the plan: its time, kind, working title, opening line and picture shown once, and each channel
 * it goes out on that day, with its own stage, from the post's first channel on.
 */
export type PlanPost = {
	postId: string;
	time: string;
	kind: string | null;
	title: string;
	hook: string;
	picture: PictureSummary;
	channels: PlanEntry[];
};

/** A day's entries gathered into the posts they are channels of, in the order the first channel of each goes out. */
export function postsOfDay(entries: PlanEntry[], pictures: PlanPictures = new Map()): PlanPost[] {
	const posts = new Map<string, PlanPost>();
	for (const entry of entries) {
		const post = posts.get(entry.postId) ?? newPostOf(entry, pictureOfPost(pictures, entry.postId));
		post.channels.push(entry);
		posts.set(entry.postId, post);
	}
	return [...posts.values()];
}

function newPostOf({ postId, time, kind, title, hook }: PlanEntry, picture: PictureSummary): PlanPost {
	return { postId, time, kind, title, hook, picture, channels: [] };
}
