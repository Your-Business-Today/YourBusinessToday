import {
	businessBrainPartKinds,
	businessBrainReadLimits,
	isBusinessBrainPartKind,
	type BusinessBrainPartKind
} from '$lib/data/businessBrainRules';
import { lengthRefusal } from './businessBrainFieldRefusals';
import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordId } from '$lib/data/isUuid';

/** A page to read, and the one earlier version of it to read instead when a revision is named. */
export type BusinessBrainPageAsked = { pageId: string; revisionId: number | null };

const wholeNumberPattern = /^[1-9][0-9]*$/;

const partRefusal = `The part is one of ${businessBrainPartKinds.join(', ')}; leave it out for the whole brain.`;
const revisionRefusal = "The revisionId is a whole number as the page's history lists it; leave it out for the page as it now reads.";

/** The part of the brain to list, null for the whole of it, or a sentence saying why the part does not fit. */
export function validateBusinessBrainPart(input: Record<string, unknown>): { part: BusinessBrainPartKind | null } | string {
	const part = trimmedText(input.part);
	if (part === '') return { part: null };
	if (!isBusinessBrainPartKind(part)) return partRefusal;
	return { part };
}

/** The words to search for, or a sentence saying why they do not fit. */
export function validateBusinessBrainSearch(input: Record<string, unknown>): { searchText: string } | string {
	const searchText = trimmedText(input.search);
	const refusal = lengthRefusal('search', searchText, businessBrainReadLimits.longestSearch, true);
	if (refusal !== null) return refusal;
	return { searchText };
}

/** The page and, if named, the earlier version of it to read, or a sentence naming the value that does not fit. */
export function validateBusinessBrainPageAsked(input: Record<string, unknown>): BusinessBrainPageAsked | string {
	const pageId = trimmedText(input.pageId);
	const idRefusal = validateRecordId('pageId', pageId);
	if (idRefusal !== null) return idRefusal;
	const revisionText = trimmedText(input.revisionId);
	if (revisionText === '') return { pageId, revisionId: null };
	const revisionId = Number(revisionText);
	const isRevisionId = wholeNumberPattern.test(revisionText) && Number.isSafeInteger(revisionId);
	if (!isRevisionId) return revisionRefusal;
	return { pageId, revisionId };
}
