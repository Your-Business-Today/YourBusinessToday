import {
	isStoryComplete,
	isStoryEmpty,
	needsUserStory,
	storyRequiredRefusal,
	type UserStory
} from '$lib/data/userStoryRule';
import type { NewTaskSeed } from './createTask';

const noStory: UserStory = { role: '', want: '', benefit: '' };

export const partStoryRefusal = 'A story needs all three parts: who it is for, what they want and why.';

/** Why a new task cannot be raised as it stands, or null when its story is in order. */
export function newTaskStoryRefusal(seed: NewTaskSeed): string | null {
	const story = seed.story ?? noStory;
	if (!isStoryEmpty(story) && !isStoryComplete(story)) return partStoryRefusal;
	if (needsUserStory(seed) && !isStoryComplete(story)) return storyRequiredRefusal;
	return null;
}
