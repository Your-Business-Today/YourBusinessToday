import { describe, expect, it, vi } from 'vitest';
import { businessBrainDomainActions } from './businessBrainDomainActions';
import { invoicesPassed, signedWord } from './businessBrainDomainFixtures';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const filed = vi.hoisted(() => ({ pages: [] as Record<string, unknown>[] }));

vi.mock('$lib/server/organisations/getOrganisation', () => ({
	getOrganisation: async () => ({ id: 'jewel', parentOrganisationId: null, name: 'Jewel Enterprises' })
}));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['business_brain'] }));
vi.mock('$lib/server/businessBrain/readDomainPages', async () => {
	const { readDomainPageFacts } = await import('$lib/data/businessBrainDomainFacts');
	return { readDomainPages: async () => filed.pages.map((page) => ({ ...page, facts: readDomainPageFacts(page.facts) })) };
});
vi.mock('$lib/server/businessBrain/readBodiesByPageId', () => ({
	readBodiesByPageId: async () => new Map([['map', 'Client work feeds Money.'], ['glossary', '**Job**: work a client pays for.']])
}));

const nigel = { accountId: 'nigel', isStaff: false, organisationMemberships: [{ organisationId: 'jewel', accountId: 'nigel', isManager: false }] } as unknown as McpCaller;

const readDomainAction = businessBrainDomainActions.find((action) => action.name === 'read_business_brain_domain') as McpAction;

function page(pageId: string, kind: string, parentPageId: string | null, facts: Record<string, unknown> = {}) {
	return { pageId, parentPageId, kind, slug: pageId, title: pageId === 'client-work' ? 'Client work' : `The ${pageId}`, summary: `About ${pageId}`, facts };
}

describe('reading the organisation’s domain', () => {
	it('says when no domain is filed yet', async () => {
		filed.pages = [];
		expect(await readDomainAction.run(nigel, { organisationId: 'jewel' })).toContain('holds no domain yet');
	});

	it('gives the context map, each context with the core marked, its entities and its glossary', async () => {
		filed.pages = [
			page('map', 'context_map', null),
			page('client-work', 'bounded_context', null, { isCoreDomain: true }),
			page('job', 'entity', 'client-work', { statuses: ['won'], fields: [{ name: 'total', type: 'money' }] }),
			page('glossary', 'glossary', 'client-work')
		];
		const answer = await readDomainAction.run(nigel, { organisationId: 'jewel' });
		expect(answer).toContain('## Context map\nClient work feeds Money.');
		expect(answer).toContain('## Client work (client-work) — the core domain');
		expect(answer).toContain('- The job (job): total. Statuses: won.');
		expect(answer).toContain('### Glossary\n**Job**: work a client pays for.');
	});

	it('gives what each word names, each context’s part and how the contexts relate', async () => {
		filed.pages = [
			page('map', 'context_map', null, { relationships: [invoicesPassed] }),
			page('client-work', 'bounded_context', null, { isCoreDomain: true }),
			page('money', 'bounded_context', null, { subdomain: 'generic' }),
			page('words', 'glossary', 'client-work', { terms: [{ ...signedWord, otherNames: ['signed pack'] }, { word: 'Client', meaning: 'Who pays', isRole: true }] })
		];
		const answer = await readDomainAction.run(nigel, { organisationId: 'jewel' });
		expect(answer).toContain('### How the contexts relate\n- Client work (client-work) to The money (money): passes Invoices; conformist');
		expect(answer).toContain('## The money (money) — a generic subdomain');
		expect(answer).toContain('- **signed contract stack**: A stack the client signed (names contract-stack in Signed; also called signed pack)');
		expect(answer).toContain('- **Client**: Who pays (a role)');
	});
});
