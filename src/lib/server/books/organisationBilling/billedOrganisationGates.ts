import type { SupabaseClient } from '@supabase/supabase-js';
import { companyDetails } from '$lib/data/companyDetails';
import { validateRecordId } from '$lib/data/isUuid';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import { BooksRefusal, refuseWhen } from '../booksRefusal';
import { addCustomer } from '../customers';
import { findBillingSchedule } from '../billingSchedules';
import { findBilledCustomer, findOwnBooks, type OwnBooks } from '../ownBooks';
import type { BillingSchedule } from '../billingScheduleRecord';
import type { Customer } from '../customerRecord';

/** Your Business Today's own books, refused when they are not on the site or when the organisation is them. */
export async function requireOwnBooksFor(service: SupabaseClient, organisation: Organisation): Promise<OwnBooks> {
	const books = await findOwnBooks(service);
	if (books === null) throw new BooksRefusal(`${companyDetails.tradingName}'s own organisation is not on the site, so there are no books to bill from.`);
	if (books.id === organisation.id) throw new BooksRefusal(`${companyDetails.tradingName} does not bill itself; its Billing is on each client organisation.`);
	return books;
}

/** The customer that stands for the organisation, made from its Details when none does yet. */
export async function requireBilledCustomer(service: SupabaseClient, books: OwnBooks, organisation: Organisation): Promise<Customer> {
	const customer = await findBilledCustomer(service, books, organisation.id);
	if (customer !== null) return customer;
	const place = { isStaff: true, organisationName: books.name };
	return addCustomer(service, { organisationId: books.id, place }, customerFieldsOf(organisation));
}

/** One of the organisation's schedules, refused when the books hold none with that id that bills it. */
export async function requireScheduleOfOrganisation(
	service: SupabaseClient,
	books: OwnBooks,
	organisation: Organisation,
	scheduleId: unknown
): Promise<BillingSchedule> {
	const writtenId = String(scheduleId ?? '');
	refuseWhen(validateRecordId('billing schedule', writtenId));
	const [customer, schedule] = await Promise.all([findBilledCustomer(service, books, organisation.id), findBillingSchedule(service, books.id, writtenId)]);
	const isBillingThisOrganisation = schedule !== null && customer !== null && schedule.customerId === customer.id;
	if (isBillingThisOrganisation) return schedule;
	throw new BooksRefusal(`No billing schedule ${writtenId} bills ${organisation.name}; it may have been changed elsewhere, so reload the page.`);
}

const detailNotGiven = '';

/** Who invoices are made out and sent to, from the organisation's Details: its legal name, or its name when none is given. */
function customerFieldsOf(organisation: Organisation): Record<string, unknown> {
	return {
		name: organisation.legalName === detailNotGiven ? organisation.name : organisation.legalName,
		contactName: organisation.accountsContactName,
		email: organisation.accountsContactEmail,
		address: organisation.address,
		billedOrganisationId: organisation.id
	};
}
