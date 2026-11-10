import { DecisionStatuses, type Decision } from '../decisions/decision';
import { depthOf, isWithinPath } from '../mediums/mediumPaths';
import { findMedium } from '../mediums/mediumCatalogue';
import { postingRhythmTraits } from '../traits/postingRhythmTraits';
import { resolveBrand } from '../resolution/resolveBrand';
import { resolvedValueOf, type ResolvedBrand } from '../resolution/resolvedBrand';
import type { Medium } from '../mediums/mediumDefinition';
import type { TraitDefinition } from '../traits/traitDefinition';
import type { Weekday } from '../values/weekdays';

const [postingDaysTrait, postingTimeTrait, postsAWeekTrait] = postingRhythmTraits;

/** Where a brand keeps its posting days, time and posts a week in its kit. */
export const PostingRhythmKeys = {
	days: postingDaysTrait.key,
	time: postingTimeTrait.key,
	postsAWeek: postsAWeekTrait.key
} as const;

/**
 * How often a brand posts on one medium, and on everything under it that has no number of its own.
 * Each medium the posts a week is decided on is one rhythm; its days and time follow the cascade to it.
 */
export type PostingRhythm = {
	mediumPath: string;
	medium: string;
	days: Weekday[] | null;
	time: string | null;
	postsAWeek: number;
};

export function postingRhythmsOf(decisions: Decision[], catalogue: TraitDefinition[]): PostingRhythm[] {
	const paths = decisions
		.filter((decision) => decision.status === DecisionStatuses.adopted)
		.filter((decision) => decision.traitKey === PostingRhythmKeys.postsAWeek)
		.map((decision) => decision.mediumPath);
	return [...new Set(paths)]
		.map(findMedium)
		.filter((medium): medium is Medium => medium !== null)
		.map((medium) => rhythmOf(resolveBrand(decisions, catalogue, medium)))
		.filter((rhythm): rhythm is PostingRhythm => rhythm !== null)
		.sort((first, second) => depthOf(first.mediumPath) - depthOf(second.mediumPath) || first.mediumPath.localeCompare(second.mediumPath));
}

/** The rhythm a post on a medium counts towards: the one decided nearest to it, or null where none is. */
export function rhythmFor(rhythms: PostingRhythm[], mediumPath: string): PostingRhythm | null {
	const covering = rhythms.filter((rhythm) => isWithinPath(mediumPath, rhythm.mediumPath));
	return covering.sort((first, second) => depthOf(second.mediumPath) - depthOf(first.mediumPath))[0] ?? null;
}

function rhythmOf(brand: ResolvedBrand): PostingRhythm | null {
	const postsAWeek = resolvedValueOf(brand, PostingRhythmKeys.postsAWeek);
	if (typeof postsAWeek !== 'number') return null;
	const days = resolvedValueOf(brand, PostingRhythmKeys.days);
	const time = resolvedValueOf(brand, PostingRhythmKeys.time);
	const { path: mediumPath, label: medium } = brand.medium;
	return {
		mediumPath,
		medium,
		days: Array.isArray(days) ? (days as Weekday[]) : null,
		time: typeof time === 'string' ? time : null,
		postsAWeek
	};
}
