import { checkStoryboard } from './checkStoryboard';
import { ContentLimits } from './contentLimits';
import { findMedium } from '../mediums/mediumCatalogue';
import { problemWithInvitedAction } from './checkInvitedAction';
import type { ContentDraftCheck } from './contentDraft';

const { titleCharacters, hookCharacters, scriptCharacters, captionCharacters } = ContentLimits;

const wordFieldLimits: Record<string, number> = {
	title: titleCharacters,
	hook: hookCharacters,
	script: scriptCharacters,
	caption: captionCharacters
};

type Words = Record<string, string>;

/** The draft as given, every value checked against its column, or the first reason it cannot be kept. */
export function checkContentDraft(input: Record<string, unknown>): ContentDraftCheck {
	const mediumPath = typeof input.medium === 'string' ? input.medium.trim() : '';
	const medium = findMedium(mediumPath);
	if (medium === null) return { problem: `${mediumPath || 'That'} is not a medium. Call read_brand_catalogue for the mediums` };
	const words = wordsOf(input);
	if ('problem' in words) return words;
	const { title, hook, script, caption, invitedAction } = words.words;
	if (title === '') return { problem: 'title is empty: give the piece a working title' };
	const actionProblem = problemWithInvitedAction(invitedAction, medium);
	if (actionProblem !== null) return { problem: actionProblem };
	const storyboard = checkStoryboard(input.storyboard);
	if ('problem' in storyboard) return storyboard;
	return { draft: { medium, title, hook, script, caption, invitedAction, storyboard: storyboard.storyboard } };
}

function wordsOf(input: Record<string, unknown>): { words: Words } | { problem: string } {
	const words: Words = {};
	for (const field of [...Object.keys(wordFieldLimits), 'invitedAction']) {
		const given = input[field] ?? '';
		if (typeof given !== 'string') return { problem: `${field} is words, not ${typeof given}` };
		words[field] = given.trim();
	}
	const tooLong = Object.keys(wordFieldLimits).find((field) => words[field].length > wordFieldLimits[field]);
	if (tooLong === undefined) return { words };
	return { problem: `${tooLong} is ${words[tooLong].length} characters; keep it to ${wordFieldLimits[tooLong]}` };
}
