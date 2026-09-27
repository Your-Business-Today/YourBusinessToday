import { readText, textField } from '../actionTypes';
import type { UserStory } from '$lib/data/userStoryRule';

export const storyFields = {
	storyRole: textField('Who the user is, such as a site manager at Jewel — the "as a…"'),
	storyWant: textField('What they want — the "I want…"'),
	storyBenefit: textField('Why it is worth having — the "so that…"')
};

export function readStory(input: Record<string, unknown>): UserStory {
	return {
		role: readText(input, 'storyRole'),
		want: readText(input, 'storyWant'),
		benefit: readText(input, 'storyBenefit')
	};
}
