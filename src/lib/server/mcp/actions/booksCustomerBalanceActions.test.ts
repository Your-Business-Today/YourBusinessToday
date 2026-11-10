import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clientId, customerId, customerWrites, heldTables, holdCustomersOnly, isHeld, jewelBespoke, runCustomerAction as run } from './booksCustomerDatabase.fixture';

const standing = vi.hoisted(() => ({ organisationName: 'Jewel Enterprises' }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: standing.organisationName })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));
vi.mock('$lib/server/clients/getClient', () => ({ getClient: async (_supabase: unknown, id: string) => (isHeld('clients') ? { id } : null) }));

describe('the customer list and the link to the clients register', () => {
	beforeEach(() => {
		standing.organisationName = 'Jewel Enterprises';
		holdCustomersOnly();
	});

	it('list each customer with what it still owes on its issued invoices', async () => {
		const issued = '00000000-0000-4000-8000-0000000001e1';
		heldTables.books_invoices = [
			{ id: issued, customer_id: customerId, status: 'issued' },
			{ id: 'draft', customer_id: customerId, status: 'draft' }
		];
		heldTables.books_invoice_lines = [
			{ invoice_id: issued, quantity: '3', unit_price: '100.00' },
			{ invoice_id: issued, quantity: '1', unit_price: '20.50' }
		];
		heldTables.books_invoice_payments = [{ invoice_id: issued, amount: '120.00' }];
		expect(await run('list_customer_balances', {})).toBe(
			`Customers of Jewel Enterprises, by name:\n- Jewel Bespoke Build: Jeremy, accounts@jewel.example; 1 High Street. Id ${customerId}\n` +
				'  2 invoices; owes £200.50 on 1 issued and unpaid.'
		);
	});

	it('leave archived customers out of the list unless asked, and refuse an answer that is not yes or no', async () => {
		heldTables.books_customers = [{ ...jewelBespoke, is_archived: true }];
		expect(await run('list_customer_balances', {})).toBe(
			"Jewel Enterprises's books hold no customers in use.\n1 archived left out; shouldIncludeArchived true lists them."
		);
		expect(await run('list_customer_balances', { shouldIncludeArchived: true })).toContain('(archived: no new invoice is raised to it)');
		expect(await run('list_customer_balances', { shouldIncludeArchived: 'yes' })).toBe('No reading was taken. shouldIncludeArchived is true or false; "yes" was given.');
	});

	it("link a customer to the clients register only from Your Business Today's staff in its own books", async () => {
		expect(await run('create_customer', { name: 'Jewel', clientId })).toContain("Only Your Business Today's staff link a customer");
		expect(await run('create_customer', { name: 'Jewel', clientId }, true)).toContain("Only Your Business Today's own books link a customer");
		standing.organisationName = 'Your Business Today';
		heldTables.clients = [];
		expect(await run('update_customer', { customerId, clientId }, true)).toContain(`No client ${clientId} is on the clients register`);
		expect(customerWrites).toEqual([]);
		heldTables.clients = [{ id: clientId }];
		await run('update_customer', { customerId, clientId }, true);
		await run('update_customer', { customerId, clientId: null });
		expect(customerWrites.map((write) => write.row)).toEqual([{ client_id: clientId }, { client_id: null }]);
	});
});
