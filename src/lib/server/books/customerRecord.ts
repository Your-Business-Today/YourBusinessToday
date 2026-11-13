import type { CustomerDetails } from '$lib/data/books/customerRules';

/**
 * A customer in an organisation's books. In Your Business Today's own books it may also be a client on the clients
 * register, and stand for the client organisation it bills.
 */
export type Customer = CustomerDetails & { id: string; isArchived: boolean; clientId: string | null; billedOrganisationId: string | null };

export type CustomerRow = {
	id: string;
	name: string;
	contact_name: string;
	email: string;
	address: string;
	is_archived: boolean;
	client_id: string | null;
	billed_organisation_id: string | null;
};

export const customersTable = 'books_customers';

export const customerColumns = 'id, name, contact_name, email, address, is_archived, client_id, billed_organisation_id';

export function fromCustomerRow(row: CustomerRow): Customer {
	return {
		id: row.id,
		name: row.name,
		contactName: row.contact_name,
		email: row.email,
		address: row.address,
		isArchived: row.is_archived,
		clientId: row.client_id,
		billedOrganisationId: row.billed_organisation_id ?? null
	};
}
