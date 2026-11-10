import type { ContextLinkKind, ContextPartKind, ReviewState } from './companyContext';

/** The heading each kind of part is listed under, in the order a reader meets the business. */
export const partKindHeadings: Record<ContextPartKind, string> = {
	context: 'Areas of the business',
	source: 'Sources where work is created',
	record: 'Kinds of record',
	process: 'Processes',
	role: 'Roles'
};

export const reviewStateLabels: Record<ReviewState, string> = {
	not_checked: 'not checked',
	right: 'right',
	not_right: 'not right'
};

/** The words between two parts' names, so each link reads as a sentence. */
export const linkKindPhrases: Record<ContextLinkKind, string> = {
	creates: 'creates',
	is_created_by: 'is created by',
	goes_next_to: 'goes next to'
};

/** What a client's Claude records and what it never records, said the same wherever it is told. */
export const conceptsNotSpecimens =
	'Record concepts, not specimens: an area, a source, a kind of record, a process or a role, never a named ' +
	'customer, an employee or their figures. Where a part was seen names the connector and the place, never ' +
	'what it held. An email address or a phone number anywhere is refused.';

/** What one part of each kind is called on the map, beside its name. */
export const partKindNames: Record<ContextPartKind, string> = {
	context: 'area',
	source: 'source',
	record: 'record',
	process: 'process',
	role: 'role'
};

/** The mark before a part's name on the map, once the client has said whether it is right. */
export const reviewStateMarks: Record<ReviewState, string> = {
	not_checked: '',
	right: '✓ ',
	not_right: '✕ '
};

/** The two marks a client gives a part on the map, in the order they are offered. */
export const partMarkChoices = [
	{ state: 'right', label: 'Right' },
	{ state: 'not_right', label: 'Not right' }
] as const satisfies readonly { state: ReviewState; label: string }[];
