import { describe, expect, it, vi } from 'vitest';
import { blankOrganisationDetails } from '$lib/data/organisationRules';
import { ledgerTables } from './booksLedgerDatabase.fixture';
import { heldInvoice, holdDraftInvoice, invoiceId, runOnTheLedger as run } from './booksInvoicePostingWorld.fixture';

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async (_supabase: unknown, id: string) => ({ ...blankOrganisationDetails, id, parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['books'] }));

describe('send_invoice where email is not set up', () => {
	it('answers that email is not set up here and keeps a skipped sending', async () => {
		holdDraftInvoice();
		heldInvoice().status = 'issued';
		ledgerTables.books_customers[0].email = 'ap@bespoke.example';
		const answer = await run('send_invoice', { invoiceId });
		expect(answer).toContain('Email is not set up here, so invoice INV-6 was not sent to ap@bespoke.example; the attempt is kept as skipped.');
		expect(answer).toContain('not sent, as email is not set up here');
		expect(ledgerTables.books_invoice_sendings).toEqual([expect.objectContaining({ invoice_id: invoiceId, delivery: 'skipped' })]);
	});
});
