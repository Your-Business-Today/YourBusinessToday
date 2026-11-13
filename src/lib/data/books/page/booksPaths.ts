import { organisationModuleRouteSegments } from '$lib/data/organisationModules';
import { portalAddress } from '$lib/portal/portalAddress';
import { spanQueryOf, type EntriesSpan } from './booksPeriodQuery';

const accountsSegment = 'accounts';
const invoicesSegment = 'invoices';

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

/** The page listing every one of the organisation's invoices by status, with its customers and billing schedules. */
export function booksInvoicesPathOf(organisationId: string): string {
	return `${booksPathOf(organisationId)}/${invoicesSegment}`;
}

/** The page that shows one of the organisation's invoices as a document, to the people keeping its books. */
export function booksInvoicePathOf(organisationId: string, invoiceId: string): string {
	return `${booksInvoicesPathOf(organisationId)}/${invoiceId}`;
}

/** The invoice document's full address, for a person's Claude to hand over as a link. */
export function booksInvoiceAddressOf(organisationId: string, invoiceId: string): string {
	return `${portalAddress.origin}${booksInvoicePathOf(organisationId, invoiceId)}`;
}
