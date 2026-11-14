import type { SupabaseClient } from '@supabase/supabase-js';
import { companyDetails } from '$lib/data/companyDetails';
import { customerColumns, customersTable, fromCustomerRow, type Customer, type CustomerRow } from './customerRecord';

/** Your Business Today's own organisation, whose books bill its clients. */
export type OwnBooks = { id: string; name: string };

/**
 * Your Business Today's own organisation, found by its name at the top of the organisations, or null when it is not on
 * the site. Read with the service key, so call it only once the caller has been let in as staff.
 */
export async function findOwnBooks(service: SupabaseClient): Promise<OwnBooks | null> {
	const { data, error } = await service
		.from('organisations')
		.select('id, name')
		.eq('name', companyDetails.tradingName)
		.is('parent_organisation_id', null)
		.maybeSingle();
	if (error !== null) throw error;
	return data as OwnBooks | null;
}

/** The customer in Your Business Today's own books that stands for the organisation, or null when none does yet. */
export async function findBilledCustomer(service: SupabaseClient, books: OwnBooks, organisationId: string): Promise<Customer | null> {
	const { data, error } = await service
		.from(customersTable)
		.select(customerColumns)
		.eq('organisation_id', books.id)
		.eq('billed_organisation_id', organisationId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return fromCustomerRow(data as unknown as CustomerRow);
}
