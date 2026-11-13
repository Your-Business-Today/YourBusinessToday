import { describe, expect, it, vi } from 'vitest';
import { clientDocumentActions } from './clientDocumentActions';
import { noSuchClientDocument } from '$lib/data/clientDocumentCatalogue';
import type { McpCaller } from '../resolveMcpCaller';

const admin = { accountId: 'admin-1', supabase: {} } as unknown as McpCaller;
const orderFormText = '# Order Form\n\nOne per stage.';

vi.mock('$lib/server/clientDocuments/readClientDocumentBySlug', () => ({
	readClientDocumentBySlug: (slug: string) => (slug === 'order-form' ? orderFormText : undefined)
}));

function run(name: string, input: Record<string, unknown> = {}) {
	const action = clientDocumentActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(admin, input);
}

describe('the client documents through the connector', () => {
	it('lists the contracts a client signs and then the internal procedures, each with its slug', async () => {
		const listing = String(await run('list_client_documents'));
		expect(listing).toContain('Contracts a client signs:\nMaster Services Agreement — Signed once per client.');
		expect(listing).toContain('— document master-services-agreement');
		expect(listing).toContain('Internal procedures:\nData Breach Procedure —');
		expect(listing.indexOf('Contracts a client signs')).toBeLessThan(listing.indexOf('Internal procedures'));
	});

	it('reads one document as Markdown under its title', async () => {
		expect(await run('read_client_document', { slug: 'order-form' })).toBe(`Order Form\n\n${orderFormText}`);
	});

	it('names the documents there are when the slug is unknown or its file is missing', async () => {
		expect(await run('read_client_document', { slug: 'not-a-document' })).toBe(noSuchClientDocument);
		expect(await run('read_client_document', { slug: 'master-services-agreement' })).toBe(noSuchClientDocument);
		expect(noSuchClientDocument).toContain('order-form, data-processing-agreement');
	});

	it('is for administrators only, and reads only', () => {
		for (const action of clientDocumentActions) {
			expect(action.audience).toBe('admin');
			expect(action.isWrite).toBe(false);
		}
	});
});
