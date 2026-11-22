import { VideoLibraries, videoLibraryNames, type VideoLibrary } from './videoLibraries';
import { VideoLimits } from './videoLimits';
import { checkOptionalWords, checkRequiredWords, isWholeNumberWithin, type FieldCheck } from '$lib/data/fieldChecks';

export type { FieldCheck };

const { longestTitle, longestDescription, longestSection, highestPosition, longestDurationSeconds } = VideoLimits;

export const titleRefusal = `title is what the video is called: required, at most ${longestTitle} characters`;
export const descriptionRefusal = `description is what the video teaches: text of at most ${longestDescription} characters`;
export const sectionRefusal = `section is the part of the library the video sits in, such as Getting started: required, at most ${longestSection} characters`;
export const positionRefusal = `position is where the video plays in the library: a whole number from 0 up to ${highestPosition}, lowest first`;
export const durationRefusal = `durationSeconds is how long the video runs: a whole number of seconds from 1 up to ${longestDurationSeconds}`;

export const libraryRefusal = `library is which of the project's video libraries it sits in: one of ${videoLibraryNames.join(', ')}`;

export function checkTitle(value: unknown): FieldCheck<string> {
	return checkRequiredWords(value, longestTitle, titleRefusal);
}

export function checkSection(value: unknown): FieldCheck<string> {
	return checkRequiredWords(value, longestSection, sectionRefusal);
}

export function checkDescription(value: unknown): FieldCheck<string> {
	return checkOptionalWords(value, longestDescription, descriptionRefusal);
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
