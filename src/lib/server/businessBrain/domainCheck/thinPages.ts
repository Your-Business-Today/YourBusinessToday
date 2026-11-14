import { candidateOf, type DomainCheckHeld } from './domainCheckHeld';
import { domainCheckKind, domainCheckLimits, type DomainCheckCandidate } from '$lib/data/domainCheck';
import { domainPageKinds } from '$lib/data/businessBrainDomain';
import type { DomainPage } from '$lib/data/organisationDomain';

/** Pages that say too little: a body shorter than a line or two, and a record with no fields. */
export function thinPages(held: DomainCheckHeld): DomainCheckCandidate[] {
	return [...shortPages(held), ...recordsWithNoFields(held)];
}

function shortPages({ pages, bodies }: DomainCheckHeld): DomainCheckCandidate[] {
	const isShort = (page: DomainPage) => {
		const body = bodies.get(page.pageId);
		return body !== undefined && body.trim().length < domainCheckLimits.shortestBody;
	};
	return pages.filter(isShort).map((page) => {
		const finding = `"${page.title}" says less than a line or two. Is there more the sources say, or is it not a page of its own?`;
		return candidateOf(domainCheckKind.thin, finding, [page]);
	});
}

function recordsWithNoFields({ pages }: DomainCheckHeld): DomainCheckCandidate[] {
	return pages.filter(isBareRecord).map((page) => {
		const finding = `The record "${page.title}" has no fields, so its screen could not be built from its page.`;
		return candidateOf(domainCheckKind.thin, finding, [page]);
	});
}

function isBareRecord({ kind, facts }: DomainPage): boolean {
	const { fields } = facts;
	return kind === domainPageKinds.entity && fields.length === 0;
}
