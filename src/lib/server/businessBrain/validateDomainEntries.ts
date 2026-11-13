import { businessBrainLimits } from '$lib/data/businessBrainRules';
import { contextMapSlug, domainPageKinds, type DomainPageKind } from '$lib/data/businessBrainDomain';
import { domainWritableKinds, type DomainContextGiven, type DomainPageWriteGiven, type DomainRetireGiven } from '$lib/data/businessBrainDomainRules';
import { bodyRefusal, isPageSlug, lengthRefusal, slugRefusal } from './businessBrainFieldRefusals';
import { trimmedText } from '$lib/data/trimmedText';
import { validateSubdomain } from './validateSubdomain';
import { validateDomainKindFacts } from './validateDomainKindFacts';
import type { PlainObject } from '$lib/data/plainObject';

const { longestTitle, longestSummary } = businessBrainLimits;

export const writableKindRefusal = `The kind is one of ${domainWritableKinds.join(', ')}; a bounded context goes in contexts.`;

/** Why a page's words do not fit their columns, or null when they do. */
function wordsRefusal(title: string, summary: string, slug: string): string | null {
	const refusal = lengthRefusal('title', title, longestTitle, true) ?? lengthRefusal('summary', summary, longestSummary, false);
	if (refusal !== null) return refusal;
	return isPageSlug(slug) ? null : slugRefusal;
}

/** A bounded context as given, or a sentence naming what does not fit. */
export function validateDomainContext(entry: PlainObject, label: string): DomainContextGiven | string {
	const slug = trimmedText(entry.slug);
	const title = trimmedText(entry.name);
	const summary = trimmedText(entry.summary);
	const refusal = wordsRefusal(title, summary, slug);
	if (refusal !== null) return `${label}: ${refusal.replace('The title', 'The name')}`;
	const body = trimmedText(entry.body) || summary;
	if (body === '') return `${label}: give the context a summary, saying what model lives in it.`;
	const part = validateSubdomain(entry);
	if (typeof part === 'string') return `${label}: ${part}`;
	return { slug, title, summary, body, ...part };
}

/** A page to write as given, or a sentence naming what does not fit. */
export function validateDomainPageWrite(entry: PlainObject, label: string): DomainPageWriteGiven | string {
	const kind = trimmedText(entry.kind);
	if (!isWritableKind(kind)) return `${label}: ${writableKindRefusal}`;
	const slug = trimmedText(entry.slug);
	const title = trimmedText(entry.title);
	const summary = trimmedText(entry.summary);
	const refusal = wordsRefusal(title, summary, slug);
	if (refusal !== null) return `${label}: ${refusal}`;
	const body = trimmedText(entry.body);
	if (body === '') return `${label}: ${bodyRefusal}`;
	const contextSlug = validateContextSlug(kind, slug, trimmedText(entry.contextSlug));
	if (typeof contextSlug !== 'string') return `${label}: ${contextSlug.refusal}`;
	const facts = validateDomainKindFacts(kind, entry, label);
	if (typeof facts === 'string') return facts;
	return { kind, slug, title, summary, body, contextSlug, facts };
}

function validateContextSlug(kind: DomainPageKind, slug: string, contextSlug: string): string | { refusal: string } {
	const isContextMap = kind === domainPageKinds.contextMap;
	if (isContextMap && slug !== contextMapSlug) return { refusal: `the context map's slug is ${contextMapSlug}.` };
	if (isContextMap) return '';
	if (isPageSlug(contextSlug)) return contextSlug;
	return { refusal: 'contextSlug names the bounded context the page lives in, by its slug.' };
}

/** A page to supersede as given, or a sentence naming what does not fit. */
export function validateDomainRetire(entry: PlainObject, label: string): DomainRetireGiven | string {
	const slug = trimmedText(entry.slug);
	const foldedIntoSlug = trimmedText(entry.foldedIntoSlug);
	const isEachASlug = isPageSlug(slug) && isPageSlug(foldedIntoSlug);
	if (!isEachASlug) return `${label}: slug and foldedIntoSlug each name a page by its slug. ${slugRefusal}`;
	if (slug === contextMapSlug) return `${label}: the context map is never superseded; revise it instead.`;
	return { slug, foldedIntoSlug };
}

function isWritableKind(kind: string): kind is DomainPageKind {
	return (domainWritableKinds as string[]).includes(kind);
}
