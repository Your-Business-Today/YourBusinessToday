import { VideoLibraries, videoLibraryNames, type VideoLibrary } from './videoLibraries';
import { VideoLimits } from './videoLimits';

/** A value that fits its column, or the sentence that refuses it by name. */
export type FieldCheck<Value> = { value: Value } | { refusal: string };

const { longestTitle, longestDescription, longestSection, highestPosition, longestDurationSeconds } = VideoLimits;

export const titleRefusal = `title is what the video is called: required, at most ${longestTitle} characters`;
export const descriptionRefusal = `description is what the video teaches: text of at most ${longestDescription} characters`;
export const sectionRefusal = `section is the part of the library the video sits in, such as Getting started: required, at most ${longestSection} characters`;
export const positionRefusal = `position is where the video plays in the library: a whole number from 0 up to ${highestPosition}, lowest first`;
export const durationRefusal = `durationSeconds is how long the video runs: a whole number of seconds from 1 up to ${longestDurationSeconds}`;

export const libraryRefusal = `library is which of the project's video libraries it sits in: one of ${videoLibraryNames.join(', ')}`;

export function checkTitle(value: unknown): FieldCheck<string> {
	return checkWords(value, longestTitle, titleRefusal);
}

export function checkSection(value: unknown): FieldCheck<string> {
	return checkWords(value, longestSection, sectionRefusal);
}

export function checkDescription(value: unknown): FieldCheck<string> {
	if (value === undefined) return { value: '' };
	if (typeof value !== 'string' || value.length > longestDescription) return { refusal: descriptionRefusal };
	return { value: value.trim() };
}

export function checkPosition(value: unknown): FieldCheck<number> {
	if (!isWholeNumberWithin(value, 0, highestPosition)) return { refusal: positionRefusal };
	return { value };
}

export function checkDuration(value: unknown): FieldCheck<number | null> {
	if (value === undefined || value === null) return { value: null };
	if (!isWholeNumberWithin(value, 1, longestDurationSeconds)) return { refusal: durationRefusal };
	return { value };
}

export function checkLibrary(value: unknown): FieldCheck<VideoLibrary> {
	if (value === undefined) return { value: VideoLibraries.tutorials };
	const isLibrary = videoLibraryNames.includes(value as VideoLibrary);
	if (!isLibrary) return { refusal: libraryRefusal };
	return { value: value as VideoLibrary };
}

export function isWholeNumberWithin(value: unknown, lowest: number, highest: number): value is number {
	if (typeof value !== 'number' || !Number.isInteger(value)) return false;
	return value >= lowest && value <= highest;
}

function checkWords(value: unknown, longest: number, refusal: string): FieldCheck<string> {
	const words = typeof value === 'string' ? value.trim() : '';
	const isFitting = words !== '' && words.length <= longest;
	if (!isFitting) return { refusal };
	return { value: words };
}
