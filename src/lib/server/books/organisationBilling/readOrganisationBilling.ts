import type { SupabaseClient } from '@supabase/supabase-js';
import { invoiceSettingDefaults } from '$lib/data/books/booksSettings';
import { summariseBillingSchedule } from '$lib/data/books/billingScheduleSummary';
import type { BilledSchedule, OrganisationBilling } from '$lib/data/books/organisationBilling';
import { ukClockAt } from '$lib/data/ukClock';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { findBillingSchedules } from '../billingSchedules';
import { findBooksSettings } from '../booksSettings';
import { findBilledCustomer, findOwnBooks, type OwnBooks } from '../ownBooks';
import { findBilledOrganisationInvoices } from './billedOrganisationInvoices';
import { findBillingChoices } from './billingChoices';

/**
 * What Your Business Today's own books bill the organisation: its schedules and the invoices raised to it, with the
 * choices the schedule's form offers. Null when the organisation is Your Business Today itself, when its books are not
 * on the site, or while the migration that links a customer to its organisation has not run. Read with the service
 * key, so call it only once the caller has been let in as staff.
 */
export async function readOrganisationBilling(service: SupabaseClient, organisationId: string): Promise<OrganisationBilling | null> {
	try {
		const books = await findOwnBooks(service);
		if (books === null || books.id === organisationId) return null;
		return await readBillingInBooks(service, books, organisationId);
	} catch (failure) {
		if (isSchemaNotYetMigrated(failure)) return null;
		throw failure;
	}
}

async function readBillingInBooks(service: SupabaseClient, books: OwnBooks, organisationId: string): Promise<OrganisationBilling> {
	const [customer, settings, choices] = await Promise.all([
		findBilledCustomer(service, books, organisationId),
		findBooksSettings(service, books.id),
		findBillingChoices(service, books)
	]);
	const today = ukClockAt(new Date()).date;
	if (customer === null) return { schedules: [], invoices: [], ...choices, today };
	const invoicePrefix = settings?.invoicePrefix ?? invoiceSettingDefaults.invoicePrefix;
	const paymentTermsDays = settings?.paymentTermsDays ?? invoiceSettingDefaults.paymentTermsDays;
	const [schedules, invoices] = await Promise.all([
		findBillingSchedules(service, books.id, { customerId: customer.id }),
		findBilledOrganisationInvoices(service, books, { id: customer.id, invoicePrefix })
	]);
	const billedSchedules: BilledSchedule[] = schedules.map((schedule) => ({ ...schedule, summary: summariseBillingSchedule(schedule, paymentTermsDays) }));
	return { schedules: billedSchedules, invoices, ...choices, today };
}
