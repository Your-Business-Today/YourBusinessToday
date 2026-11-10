import type { CustomerDetails } from '$lib/data/books/customerRules';

/** A customer in an organisation's books, and the client on the clients register it is, when Your Business Today's own books link one. */
export type Customer = CustomerDetails & { id: string; isArchived: boolean; clientId: string | null };

export type CustomerRow = {
	id: string;
	name: string;
	contact_name: string;
	email: string;
	address: string;
	is_archived: boolean;
	client_id: string | null;
};

export const customersTable = 'books_customers';

export const customerColumns = 'id, name, contact_name, email, address, is_archived, client_id';

export function fromCustomerRow(row: CustomerRow): Customer {
	return {
		id: row.id,
		name: row.name,
		contactName: row.contact_name,
		email: row.email,
		address: row.address,
		isArchived: row.is_archived,
		clientId: row.client_id
	};
}
