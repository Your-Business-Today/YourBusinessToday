import { VideoLimits, captionsTypes, thumbnailTypes, videoFileTypes } from './videoLimits';
import { isWholeNumberWithin } from '$lib/data/fieldChecks';
import type { VideoFileGiven } from './projectVideo';

type Input = Record<string, unknown>;

/** How one file is checked: the fields that name it, the types it may be and the most it may weigh. */
type FileRule = { prefix: string; types: readonly string[]; largestByteCount: number; largestMegabytes: number };

const { longestFilename } = VideoLimits;

const filmRule: FileRule = { prefix: '', types: videoFileTypes, largestByteCount: VideoLimits.largestByteCount, largestMegabytes: VideoLimits.largestMegabytes };
const thumbnailRule: FileRule = {
	prefix: 'thumbnail',
	types: thumbnailTypes,
	largestByteCount: VideoLimits.largestThumbnailByteCount,
	largestMegabytes: VideoLimits.largestThumbnailMegabytes
};
const captionsRule: FileRule = {
	prefix: 'captions',
	types: captionsTypes,
	largestByteCount: VideoLimits.largestCaptionsByteCount,
	largestMegabytes: VideoLimits.largestCaptionsMegabytes
};

/** The film as described, checked against its columns and the bucket, or the reason it cannot be kept. */
export function validateFilmFile(input: Input): VideoFileGiven | string {
	return validateFile(input, filmRule);
}

/** The thumbnail as described, none when no thumbnail is named, or the reason it cannot be kept. */
export function validateThumbnailFile(input: Input): VideoFileGiven | null | string {
	return validateCompanionFile(input, thumbnailRule);
}

/** The captions as described, none when no captions are named, or the reason they cannot be kept. */
export function validateCaptionsFile(input: Input): VideoFileGiven | null | string {
	return validateCompanionFile(input, captionsRule);
}

function validateCompanionFile(input: Input, rule: FileRule): VideoFileGiven | null | string {
	const filenameField = fieldName(rule, 'filename');
	if (input[filenameField] === undefined) return null;
	return validateFile(input, rule);
}

function fieldName(rule: FileRule, field: string): string {
	if (rule.prefix === '') return field;
	return `${rule.prefix}${field[0].toUpperCase()}${field.slice(1)}`;
}

function validateFile(input: Input, rule: FileRule): VideoFileGiven | string {
	const [filenameField, mimeTypeField, byteCountField] = ['filename', 'mimeType', 'byteCount'].map((field) => fieldName(rule, field));
	const filename = typeof input[filenameField] === 'string' ? (input[filenameField] as string).trim() : '';
	const isFilenameFitting = filename !== '' && filename.length <= longestFilename;
	if (!isFilenameFitting) return `${filenameField} is what the file is called: required, at most ${longestFilename} characters`;
	const mimeType = input[mimeTypeField];
	const isKeptType = typeof mimeType === 'string' && rule.types.includes(mimeType);
	if (!isKeptType) return `${mimeTypeField} is the type of the file, one of ${rule.types.join(', ')}`;
	const byteCount = input[byteCountField];
	const isFittingSize = isWholeNumberWithin(byteCount, 1, rule.largestByteCount);
	if (!isFittingSize) return `${byteCountField} is the file's size in bytes: a whole number from 1 up to ${rule.largestByteCount} (${rule.largestMegabytes} MB)`;
	return { filename, mimeType, byteCount };
}
