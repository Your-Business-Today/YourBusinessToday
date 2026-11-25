import { isStoryComplete, type UserStory } from '$lib/data/userStoryRule';
import { departmentColumns } from '$lib/server/departments/departmentColumns';
import { designReviewStates } from '$lib/data/designReview';
import type { NewTaskSeed } from './createTask';

/** Who asked for a new task, its department, and whether it waits for YBT to approve a change to the design. */
export function requestColumns(seed: NewTaskSeed): Record<string, unknown> {
	const requester = { requested_by: seed.requestedBy ?? null, is_autocomplete: seed.autocomplete ?? null };
	const givenId = seed.id === undefined ? {} : { id: seed.id };
	return { ...givenId, ...requester, ...departmentColumns(seed.department), ...designColumns(seed.designChange) };
}

function designColumns(designChange: string | undefined): Record<string, unknown> {
	if (designChange === undefined) return {};
	return { design_review_state: designReviewStates.awaiting, design_change: designChange };
}

export function storyColumns(story: UserStory | undefined): Record<string, unknown> {
	if (story === undefined || !isStoryComplete(story)) return {};
	return {
		is_user_story: true,
		story_role: story.role,
		story_want: story.want,
		story_benefit: story.benefit
	};
}
