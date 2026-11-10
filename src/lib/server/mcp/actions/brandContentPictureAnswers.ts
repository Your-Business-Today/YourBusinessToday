import { isAwaitingPicture } from '$lib/brand/pictures/postPictures';
import { noKindYet } from '$lib/brand/plan/planCounts';
import { PictureActions, pictureMarkOf } from './describePostPictures';
import type { ContentPlan, PlanDay } from '$lib/brand/plan/contentPlan';
import type { ContentPost } from '$lib/brand/posts/contentPost';
import type { PictureNeed } from '$lib/brand/pictures/checkPictureNeed';
import type { PlanPost } from '$lib/brand/plan/planPosts';

const oneChannel = 1;

function everyChannelOf({ channels }: ContentPost): string {
	return channels.length === oneChannel ? 'the post' : `all ${channels.length} channels of the post`;
}

/** What the connector says of each outcome when a post's picture is said or chosen. */
export const pictureAnswers = {
	needNotKept: (problem: string) => `The picture needed was not kept: ${problem}. Nothing was kept.`,
	needKept: ({ needed, expectedFrom }: PictureNeed, post: ContentPost) =>
		`Kept for ${everyChannelOf(post)}: it needs ${needed}${expectedFrom === null ? '' : `, expected from ${expectedFrom}`}. ` +
		`Choose one from list_brand_library with ${PictureActions.choose}.`,
	notChosen: (problem: string) => `The picture was not chosen: ${problem}. Nothing was kept.`,
	noSuchItem: 'The picture was not chosen: this brand’s library keeps no photo or video by that itemId. Find its id with list_brand_library. Nothing was kept.',
	chosen: (filename: string, post: ContentPost) => `Chose ${filename} for ${everyChannelOf(post)}. read_content shows it beside the caption.`,
	alreadyChosen: (filename: string) => `${filename} was already chosen for this post, so nothing was kept twice.`
};

/** The month's posts that still wait on a picture, each once however many channels it goes out on, with what it needs. */
export function describePostsAwaitingPicture(brandName: string, plan: ContentPlan): string {
	const lines = plan.weeks.flatMap((week) => week.days.flatMap(awaitingLinesOfDay));
	if (lines.length === 0) return `No post of ${brandName}’s plan for ${plan.monthLabel} is waiting on a picture.`;
	const heading = `Posts of ${brandName}’s plan for ${plan.monthLabel} waiting on a picture: ${lines.length}. Times are on the UK clock.`;
	const howTo = `Choose one for each from list_brand_library with ${PictureActions.choose}, giving any channel’s id.`;
	return [heading, ...lines, howTo].join('\n');
}

function awaitingLinesOfDay(day: PlanDay): string[] {
	return day.posts.filter(({ picture }) => isAwaitingPicture(picture)).map((post) => awaitingLine(day, post));
}

function awaitingLine(day: PlanDay, { time, title, kind, picture, channels }: PlanPost): string {
	const [firstChannel] = channels;
	const mediums = channels.map((channel) => channel.medium).join(', ');
	const post = `${time} ${title} (${kind ?? noKindYet}) on ${mediums}`;
	return `- ${day.label} ${post} — needs ${picture.needed ?? ''}${pictureMarkOf(picture)} (id ${firstChannel.id})`;
}
