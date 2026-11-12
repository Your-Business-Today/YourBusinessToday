import { describe, expect, it } from 'vitest';
import { describeDomainRun } from './describeDomainRun';
import type { DomainRunStanding } from './domainRunStanding';
import type { OrganisationDomain } from '$lib/data/organisationDomain';

const organisation = { id: 'org-1', parentOrganisationId: null, name: 'Oak & Ash Joinery' } as DomainRunStanding['organisation'];

const firstRun: DomainRunStanding = { organisation, domain: null, sources: [], context: null, products: [], switchedOn: ['business_brain'] };

const filedDomain = {
	model: { contexts: [], relationships: [] },
	contexts: [{ pageId: 'p1', slug: 'joinery', title: 'Joinery', summary: '', isCoreDomain: true, blocks: [] }],
	contextMap: null
} as OrganisationDomain;

describe('the domain run', () => {
	it('starts a first run broad, and ends by filing on the person’s yes and giving the Domain tab', () => {
		const walk = describeDomainRun(firstRun);
		expect(walk).toContain('The domain: nothing yet. This is the first run');
		expect(walk).toContain('file_business_brain_domain with organisationId org-1, one call per source');
		expect(walk).toContain('/organisations/org-1/domain');
	});

	it('carries the modeller’s rules: concepts never specimens, and exactly one core domain', () => {
		const walk = describeDomainRun(firstRun);
		expect(walk).toContain('Model concepts, never specimens.');
		expect(walk).toContain('Exactly one context is the CORE DOMAIN');
	});

	it('builds on a domain already filed, naming its core and the sources it came from', () => {
		const sources = [{ sourceId: 's1', title: 'Staff handbook', origin: '', filedAt: '2026-11-12T08:00:00Z' }];
		const walk = describeDomainRun({ ...firstRun, domain: filedDomain, sources, products: [{ id: 'p-1', name: 'Shop' }] });
		expect(walk).toContain('1 contexts, Joinery the core domain');
		expect(walk).toContain('Filed from: Staff handbook (2026-11-12)');
		expect(walk).toContain('Shop (p-1)');
	});
});
