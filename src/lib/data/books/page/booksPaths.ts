import { organisationModuleRouteSegments } from '$lib/data/organisationModules';
import { spanQueryOf, type EntriesSpan } from './booksPeriodQuery';

const accountsSegment = 'accounts';

/** The books page of an organisation, as the side bar opens it. */
export function booksPathOf(organisationId: string): string {
	return `/organisations/${organisationId}/${organisationModuleRouteSegments.books}`;
}

/** The page listing the entries behind one account's figure over a span of days. */
export function accountEntriesPathOf(organisationId: string, accountCode: string, span: EntriesSpan): string {
	const accountPath = `${booksPathOf(organisationId)}/${accountsSegment}/${encodeURIComponent(accountCode)}`;
	return `${accountPath}?${spanQueryOf(span)}`;
}

/** The books page over the same days, from an account's entries. */
export function booksPathOver(organisationId: string, span: EntriesSpan): string {
	return `${booksPathOf(organisationId)}?${spanQueryOf(span)}`;
}
