import { checkDescription, checkDuration, checkLibrary, checkPosition, checkSection, checkTitle, type FieldCheck } from './videoFieldChecks';
import { checkNamedFields } from '$lib/data/fieldChecks';
import type { VideoDetails } from './projectVideo';

type Input = Record<string, unknown>;

const detailChecks = {
	title: checkTitle,
	description: checkDescription,
	section: checkSection,
	position: checkPosition,
	durationSeconds: checkDuration,
	library: checkLibrary
} as const satisfies Record<keyof VideoDetails, (value: unknown) => FieldCheck<unknown>>;

type DetailField = keyof typeof detailChecks;

const detailFields = Object.keys(detailChecks) as DetailField[];

/** Every detail of a new video, each checked against its column, or the first that does not fit. */
export function validateVideoDetails(input: Input): VideoDetails | string {
	return checkFields(input, detailFields) as VideoDetails | string;
}

/** Only the details a change names, each checked against its column; a change that names none is refused. */
export function validateVideoChanges(input: Input): Partial<VideoDetails> | string {
	const named = detailFields.filter((field) => input[field] !== undefined);
	if (named.length === 0) return `name at least one of ${detailFields.join(', ')} to change`;
	return checkFields(input, named);
}

function checkFields(input: Input, fields: DetailField[]): Partial<VideoDetails> | string {
	return checkNamedFields(input, fields, detailChecks) as Partial<VideoDetails> | string;
}
