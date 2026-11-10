import { beforeEach, describe, expect, it, vi } from 'vitest';
import { booksActions } from './booksActions';
import { isGatedByModuleRule, moduleNotSwitchedOn } from '../organisationModuleGate';
import { customerId, customerWrites, holdCustomersOnly, organisationId, runCustomerAction as run, heldTables } from './booksCustomerDatabase.fixture';

const customerNames = ['list_customer_balances', 'create_customer', 'update_customer'];

const standing = vi.hoisted(() => ({ switchedOn: [] as string[] }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => standing.switchedOn }));

describe('the customer actions', () => {
	beforeEach(() => {
		standing.switchedOn = ['books'];
		holdCustomersOnly();
	});

	it('are each built by the one module rule, and change nothing for an organisation without Books', async () => {
		const customerActions = booksActions.filter((action) => customerNames.includes(action.name));
		expect(customerActions.filter((action) => !isGatedByModuleRule(action) || action.module !== 'books')).toEqual([]);
		expect(customerActions).toHaveLength(customerNames.length);
		standing.switchedOn = [];
		for (const name of customerNames) expect(await run(name, { customerId, name: 'Shop' })).toBe(moduleNotSwitchedOn('books'));
		expect(customerWrites).toEqual([]);
	});

	it('add a customer as given, leaving out what the person did not say', async () => {
		const answer = await run('create_customer', { name: 'Jewel Bespoke Build', email: 'accounts@jewel.example' });
		const row = { organisation_id: organisationId, name: 'Jewel Bespoke Build', contact_name: '', email: 'accounts@jewel.example', address: '' };
		expect(customerWrites).toEqual([{ table: 'books_customers', row }]);
		expect(answer).toBe(`Added to Jewel Enterprises's customers:\n- Jewel Bespoke Build: Jeremy, accounts@jewel.example; 1 High Street. Id ${customerId}`);
	});

	it('refuse a blank name, a padded name and an email that is not one, writing nothing', async () => {
		expect(await run('create_customer', { name: ' ' })).toBe('Nothing was saved. name cannot be blank: it is who every invoice is made out to.');
		expect(await run('create_customer', { name: 'Shop ' })).toBe('Nothing was saved. name starts or ends with a space; give it without one.');
		expect(await run('create_customer', { name: 'Shop', email: 'jeremy' })).toContain('Nothing was saved. email is the address invoices are sent to');
		expect(await run('update_customer', { customerId, address: 12 })).toBe('Nothing was saved. address is text; 12 was given.');
		expect(customerWrites).toEqual([]);
	});

	it('change only what was given, and archive', async () => {
		expect(await run('update_customer', { customerId, contactName: 'Nigel', isArchived: true })).toContain("Saved. Jewel Enterprises's customer now reads:");
		expect(customerWrites).toEqual([{ table: 'books_customers', row: { contact_name: 'Nigel', is_archived: true } }]);
	});

	it('refuse a change with nothing in it, and a customer the books do not hold', async () => {
		expect(await run('update_customer', { customerId })).toContain('Nothing was saved. No change was given.');
		heldTables.books_customers = [];
		expect(await run('update_customer', { customerId, name: 'Shop' })).toContain(`Nothing was saved. No customer ${customerId} is in this organisation's books`);
	});
});
