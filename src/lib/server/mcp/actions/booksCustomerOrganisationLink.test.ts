import { beforeEach, describe, expect, it, vi } from 'vitest';
import { customerId, customerWrites, holdCustomersOnly, organisationId, runCustomerAction as run } from './booksCustomerDatabase.fixture';

const clientOrganisationId = '00000000-0000-4000-8000-0000000b1110';

const standing = vi.hoisted(() => ({ organisationName: 'Your Business Today' }));
vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => {
		if (id === organisationId) return { id, parentOrganisationId: null, name: standing.organisationName };
		if (id === clientOrganisationId) return { id, parentOrganisationId: null, name: 'Prentice' };
		return null;
	}
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

describe("update_customer's link to the organisation a customer bills", () => {
	beforeEach(() => {
		standing.organisationName = 'Your Business Today';
		holdCustomersOnly();
	});

	it("links a customer of Your Business Today's own books to a client organisation, from its staff, and takes the link away", async () => {
		expect(await run('update_customer', { customerId, billedOrganisationId: clientOrganisationId }, true)).toContain('Saved.');
		await run('update_customer', { customerId, billedOrganisationId: null }, true);
		expect(customerWrites.map((write) => write.row)).toEqual([{ billed_organisation_id: clientOrganisationId }, { billed_organisation_id: null }]);
	});

	it('refuses the link from anyone but staff, in any other books, to the books themselves and to no organisation', async () => {
		expect(await run('update_customer', { customerId, billedOrganisationId: clientOrganisationId })).toContain(
			"Only Your Business Today's staff link a customer to the client organisation it bills; leave billedOrganisationId out."
		);
		expect(await run('update_customer', { customerId, billedOrganisationId: organisationId }, true)).toContain('do not bill Your Business Today');
		const unknownId = '00000000-0000-4000-8000-0000000b9999';
		expect(await run('update_customer', { customerId, billedOrganisationId: unknownId }, true)).toContain(`No organisation ${unknownId}`);
		expect(await run('update_customer', { customerId, billedOrganisationId: 'Prentice' }, true)).toContain('The billed organisation must be an id');
		standing.organisationName = 'Jewel Enterprises';
		expect(await run('update_customer', { customerId, billedOrganisationId: clientOrganisationId }, true)).toContain(
			"Only Your Business Today's own books link a customer to the client organisation it bills"
		);
		expect(customerWrites).toEqual([]);
	});
});
