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
