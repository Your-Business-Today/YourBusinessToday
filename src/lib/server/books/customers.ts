import type { SupabaseClient } from '@supabase/supabase-js';
import { customerDetailColumns, validateCustomerChange, validateNewCustomer, type CustomerChange } from '$lib/data/books/customerRules';
import type { ClientLinkPlace } from '$lib/data/books/clientRegisterLink';
import { validateRecordId } from '$lib/data/isUuid';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { readEveryPage } from './everyPage';
import { resolveClientLink } from './customerClientLink';
import { billedOrganisationTakenRefusal, resolveBilledOrganisationLink } from './customerOrganisationLink';
import { customerColumns, customersTable, fromCustomerRow, type Customer, type CustomerRow } from './customerRecord';

/** Where a customer is kept: the organisation's books, and who is keeping them, for the client link. */
export type CustomerBooks = { organisationId: string; place: ClientLinkPlace };

/** Every customer of the organisation by name, archived ones included. */
export async function findCustomers(supabase: SupabaseClient, organisationId: string): Promise<Customer[]> {
	const rows = await readEveryPage(async (pageStart, pageEnd) => {
		const { data, error } = await supabase
			.from(customersTable)
			.select(customerColumns)
			.eq('organisation_id', organisationId)
			.order('name')
			.order('id')
			.range(pageStart, pageEnd);
		if (error !== null) throw error;
		return data as unknown as CustomerRow[];
	});
	return rows.map(fromCustomerRow);
}

/** The organisation's customer with that id, archived or not, or null when its books hold none. */
export async function findCustomer(supabase: SupabaseClient, organisationId: string, customerId: string): Promise<Customer | null> {
	const query = supabase.from(customersTable).select(customerColumns).eq('organisation_id', organisationId).eq('id', customerId);
	const { data, error } = await query.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return fromCustomerRow(data as unknown as CustomerRow);
}

/** Adds a customer an invoice can be made out to. */
export async function addCustomer(supabase: SupabaseClient, books: CustomerBooks, fields: Record<string, unknown>): Promise<Customer> {
	const details = validateNewCustomer(fields);
	if (typeof details === 'string') throw new BooksRefusal(details);
	const links = await linkColumns(supabase, books, fields);
	const row: Record<string, unknown> = { organisation_id: books.organisationId, ...detailColumns(details), ...links };
	const { data, error } = await supabase.from(customersTable).insert(row).select(customerColumns).single();
	if (error !== null) refuseLinkTakenOrThrow(error);
	return fromCustomerRow(data as unknown as CustomerRow);
}

/** Changes only what was given of one of the organisation's customers; everything left out keeps what the books hold. */
export async function changeCustomer(supabase: SupabaseClient, books: CustomerBooks, fields: Record<string, unknown>): Promise<Customer> {
	const change = validateCustomerChange(fields);
	if (typeof change === 'string') throw new BooksRefusal(change);
	refuseWhen(validateRecordId('customer', String(fields.customerId ?? '')));
	const row = await changeColumns(supabase, books, change, fields);
	const { data, error } = await supabase
		.from(customersTable)
		.update(row)
		.eq('organisation_id', books.organisationId)
		.eq('id', fields.customerId)
		.select(customerColumns)
		.maybeSingle();
	if (error !== null) refuseLinkTakenOrThrow(error);
	if (data === null) throw new BooksRefusal(`No customer ${fields.customerId} is in this organisation's books; list_customer_balances lists them.`);
	return fromCustomerRow(data as unknown as CustomerRow);
}

async function changeColumns(supabase: SupabaseClient, books: CustomerBooks, change: CustomerChange, fields: Record<string, unknown>): Promise<Record<string, unknown>> {
	const { isArchived, ...details } = change;
	const row: Record<string, unknown> = { ...detailColumns(details), ...(await linkColumns(supabase, books, fields)) };
	if (isArchived !== undefined) row.is_archived = isArchived;
	return row;
}

/** The links to the clients register and to the organisation billed that were given, each checked where it is kept. */
async function linkColumns(supabase: SupabaseClient, books: CustomerBooks, fields: Record<string, unknown>): Promise<Record<string, unknown>> {
	const row: Record<string, unknown> = {};
	if (fields.clientId !== undefined) row.client_id = await resolveClientLink(supabase, books.place, fields.clientId);
	if (fields.billedOrganisationId === undefined) return row;
	const place = { ...books.place, booksOrganisationId: books.organisationId };
	row.billed_organisation_id = await resolveBilledOrganisationLink(supabase, place, fields.billedOrganisationId);
	return row;
}

function refuseLinkTakenOrThrow(error: { code?: string; message?: string }): never {
	refuseWhen(billedOrganisationTakenRefusal(error));
	throw error;
}

function detailColumns(details: CustomerChange): Record<string, unknown> {
	const given = Object.entries(details).filter(([name]) => name in customerDetailColumns);
	return Object.fromEntries(given.map(([name, value]) => [customerDetailColumns[name as keyof typeof customerDetailColumns], value]));
}
