import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PortalVisitor } from '$lib/portal/portalVisitor';

const { findBilledInvoice, findInvoiceDocument } = vi.hoisted(() => ({ findBilledInvoice: vi.fn(), findInvoiceDocument: vi.fn() }));
vi.mock('$lib/server/payments/supabaseServiceClient', () => ({ supabaseServiceClient: () => ({}) }));
vi.mock('./billedInvoices', () => ({ findBilledInvoice }));
vi.mock('$lib/server/books/invoiceDocument', () => ({ findInvoiceDocument }));

const { requirePortalInvoiceDocument } = await import('./portalInvoiceDocument');

const invoiceId = '11111111-1111-4111-8111-111111111111';
const visitor = { clientId: 'client-of-another-business' } as PortalVisitor;
const notFound = 404;

describe('an invoice document opened from the portal', () => {
	beforeEach(() => vi.clearAllMocks());

	it('is not found for a visitor whose client the invoice was not raised to', async () => {
		findBilledInvoice.mockResolvedValue(null);
		await expect(requirePortalInvoiceDocument(visitor, invoiceId)).rejects.toMatchObject({ status: notFound });
		expect(findBilledInvoice).toHaveBeenCalledWith({}, visitor.clientId, invoiceId);
		expect(findInvoiceDocument).not.toHaveBeenCalled();
	});

	it('is not found for an address that names no invoice', async () => {
		await expect(requirePortalInvoiceDocument(visitor, 'not-an-id')).rejects.toMatchObject({ status: notFound });
		expect(findBilledInvoice).not.toHaveBeenCalled();
	});

	it('is the document of an invoice raised to the visitor’s client', async () => {
		const document = { invoiceId, printedNumber: 'INV-3' };
		findBilledInvoice.mockResolvedValue({ organisationId: 'books-organisation' });
		findInvoiceDocument.mockResolvedValue(document);
		await expect(requirePortalInvoiceDocument(visitor, invoiceId)).resolves.toBe(document);
	});
});
