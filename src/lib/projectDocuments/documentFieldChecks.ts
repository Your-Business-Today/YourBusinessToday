import { DocumentLimits, defaultDocumentSection } from './documentLimits';
import { checkOptionalWords, checkRequiredWords, isWholeNumberWithin, type FieldCheck } from '$lib/data/fieldChecks';

const { longestTitle, longestSummary, longestSection, longestMarkdown, highestPosition } = DocumentLimits;

export const titleRefusal = `title is what the document is called: required, at most ${longestTitle} characters`;
export const summaryRefusal = `summary is what the document is about: text of at most ${longestSummary} characters`;
export const sectionRefusal = `section is the part of the project's documents it sits in, such as How it works: at most ${longestSection} characters`;
export const positionRefusal = `position is where the document is listed in its section: a whole number from 0 up to ${highestPosition}, lowest first`;
export const markdownRefusal = `markdown is the document's text, written in Markdown: from 1 up to ${longestMarkdown} characters`;

export function checkTitle(value: unknown): FieldCheck<string> {
	return checkRequiredWords(value, longestTitle, titleRefusal);
}

export function checkSummary(value: unknown): FieldCheck<string> {
	return checkOptionalWords(value, longestSummary, summaryRefusal);
}

export function checkSection(value: unknown): FieldCheck<string> {
	if (value === undefined) return { value: defaultDocumentSection };
	return checkRequiredWords(value, longestSection, sectionRefusal);
}

export function checkPosition(value: unknown): FieldCheck<number> {
	if (value === undefined) return { value: 0 };
	if (!isWholeNumberWithin(value, 0, highestPosition)) return { refusal: positionRefusal };
	return { value };
}

export function checkMarkdown(value: unknown): FieldCheck<string> {
	const isFitting = typeof value === 'string' && value.trim() !== '' && value.length <= longestMarkdown;
	if (!isFitting) return { refusal: markdownRefusal };
	return { value };
}
