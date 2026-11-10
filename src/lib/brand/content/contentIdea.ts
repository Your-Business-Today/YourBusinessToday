import { checkMoment } from './checkMoment';
import { ContentLimits } from './contentLimits';
import { findMedium } from '../mediums/mediumCatalogue';
import type { Medium } from '../mediums/mediumDefinition';

/** An idea written down for a day before any script exists: the medium, a working title, its opening line and when it goes out. */
export type ContentIdea = { medium: Medium; title: string; hook: string; plannedFor: string };

export type ContentIdeaCheck = { idea: ContentIdea } | { problem: string };

const { titleCharacters, hookCharacters } = ContentLimits;

/** The idea as given, every value checked against its column, or the first reason it cannot be kept. */
export function checkContentIdea(input: Record<string, unknown>): ContentIdeaCheck {
	const mediumPath = typeof input.medium === 'string' ? input.medium.trim() : '';
	const medium = findMedium(mediumPath);
	if (medium === null) return { problem: `${mediumPath || 'That'} is not a medium. Call read_brand_catalogue for the mediums` };
	const title = wordsOf(input.title);
	const hook = wordsOf(input.hook ?? '');
	if (title === null) return { problem: `title is words, not ${typeof input.title}` };
	if (hook === null) return { problem: `hook is words, not ${typeof input.hook}` };
	if (title === '') return { problem: 'title is empty: give the idea a working title' };
	if (title.length > titleCharacters) return { problem: `title is ${title.length} characters; keep it to ${titleCharacters}` };
	if (hook.length > hookCharacters) return { problem: `hook is ${hook.length} characters; keep it to ${hookCharacters}` };
	const plannedFor = checkMoment('plannedFor', input.plannedFor);
	if ('problem' in plannedFor) return plannedFor;
	return { idea: { medium, title, hook, plannedFor: plannedFor.moment } };
}

function wordsOf(given: unknown): string | null {
	return typeof given === 'string' ? given.trim() : null;
}
