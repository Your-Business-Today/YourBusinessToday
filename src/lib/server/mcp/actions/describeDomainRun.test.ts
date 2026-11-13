import { describe, expect, it } from 'vitest';
import { describeDomainRun } from './describeDomainRun';
import { contractStackMap } from '$lib/data/workflowMap/tests/contractStackMap';
import type { DomainRunStanding } from './domainRunStanding';
import type { OrganisationDomain } from '$lib/data/organisationDomain';

const organisation = { id: 'org-1', parentOrganisationId: null, name: 'Oak & Ash Joinery' } as unknown as DomainRunStanding['organisation'];

const firstRun: DomainRunStanding = { organisation, map: null, domain: null, sources: [], products: [], switchedOn: ['business_brain'] };

const filedDomain = {
	model: { contexts: [], relationships: [] },
	contexts: [{ pageId: 'p1', slug: 'joinery', title: 'Joinery', summary: '', isCoreDomain: true, blocks: [] }],
	contextMap: null
} as unknown as OrganisationDomain;

describe('the domain run', () => {
	it('opens with what the domain is for', () => {
		const walk = describeDomainRun(firstRun);
		expect(walk).toContain('a record’s screen could be built from its page and a new starter could do a task from its station');
	});

	it('starts a first run as a first model, and ends by filing on the person’s yes and giving the Domain tab', () => {
		const walk = describeDomainRun(firstRun);
		expect(walk).toContain('The domain: nothing yet. This is the first run, so it is a first model');
		expect(walk).toContain('file_business_brain_domain with organisationId org-1, one call per source');
		expect(walk).toContain('/organisations/org-1/domain');
	});

	it('offers to map the workflows first when no map is filed', () => {
		const walk = describeDomainRun(firstRun);
		expect(walk).toContain('The workflow map: none filed for Oak & Ash Joinery yet');
		expect(walk).toContain('offer "map the workflows" (start_workflow_map_run) first');
	});

	it('names today’s map first and has every phrase on it resolved', () => {
		const walk = describeDomainRun({ ...firstRun, map: contractStackMap });
		expect(walk).toContain('The workflow map: version 2 of the After map, filed 2026-11-13: 2 lines, 2 stations, 1 hand-overs and 3 phrases');
		expect(walk).toContain('Read it whole with read_workflow_map first');
		expect(walk).toContain('say what each is: a record, a record in a status, a detail or an event');
		expect(walk).not.toContain('none filed');
	});

	it('models this one business, sized for a first model, not any business doing the work', () => {
		const walk = describeDomainRun(firstRun);
		expect(walk).toContain('Model THIS business.');
		expect(walk).toContain('Model concepts, never specimens.');
		expect(walk).toContain('Exactly one context is the CORE DOMAIN');
		expect(walk).not.toContain('ANY business');
		expect(walk).not.toContain('prefer fewer, richer pages');
		expect(walk).not.toContain('one to three');
	});

	it('asks for the detail stage by stage, reads each source for what it tells and speaks the page’s words', () => {
		const walk = describeDomainRun(firstRun);
		expect(walk).toContain('"## What makes one", "## Lifecycle"');
		expect(walk).toContain('An event is the record first, in the past tense');
		expect(walk).toContain('A contract or a policy: rules and terms.');
		expect(walk).toContain('**The event at each hand-over:**');
		expect(walk).toContain('Area for a bounded context, Record for an entity');
		expect(walk).not.toContain('Ask the person where you are unsure');
	});

	it('builds on a domain already filed, naming its core and the sources it came from', () => {
		const sources = [{ sourceId: 's1', title: 'Staff handbook', origin: '', filedAt: '2026-11-12T08:00:00Z' }];
		const walk = describeDomainRun({ ...firstRun, domain: filedDomain, sources, products: [{ id: 'p-1', name: 'Shop' }] });
		expect(walk).toContain('1 contexts, Joinery the core domain');
		expect(walk).toContain('Filed from: Staff handbook (2026-11-12)');
		expect(walk).toContain('Shop (p-1)');
	});
});
