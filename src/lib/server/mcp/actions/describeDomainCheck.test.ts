import { describe, expect, it, vi } from 'vitest';
import { businessBrainDomainActions } from './businessBrainDomainActions';
import { checkHeldOf, healthyJoineryPages } from '$lib/server/businessBrain/domainCheck/tests/healthyJoinery';
import { describeDomainCheck, type DomainCheckStanding } from './describeDomainCheck';
import { domainCheckCandidates } from '$lib/server/businessBrain/domainCheckCandidates';
import { joineryPage, withPage } from '$lib/server/businessBrain/domainGaps/tests/joineryDomain';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const filed = vi.hoisted(() => ({ pages: [] as unknown[] }));

vi.mock('$lib/server/organisations/getOrganisation', () => ({ getOrganisation: async () => ({ id: 'oak', parentOrganisationId: null, name: 'Oak & Ash Joinery' }) }));
vi.mock('$lib/server/organisations/getSwitchedOnModules', () => ({ getSwitchedOnModules: async () => ['business_brain'] }));
vi.mock('$lib/server/businessBrain/readDomainPages', () => ({ readDomainPages: async () => filed.pages }));
vi.mock('$lib/server/workflowMap/readTodaysWorkflowMap', () => ({ readTodaysWorkflowMap: async () => null }));
vi.mock('$lib/server/businessBrain/readBodiesByPageId', () => ({ readBodiesByPageId: async () => new Map() }));
vi.mock('$lib/server/businessBrain/readDomainCheckPages', () => ({ readDomainCheckPages: async () => ({ bodies: new Map(), retiredSlugs: [] }) }));

const organisation = { id: 'org-1', parentOrganisationId: null, name: 'Oak & Ash Joinery' } as unknown as DomainCheckStanding['organisation'];

const person = { accountId: 'person', isStaff: false, organisationMemberships: [{ organisationId: 'oak', accountId: 'person', isManager: false }] } as unknown as McpCaller;

const checkAction = businessBrainDomainActions.find((action) => action.name === 'start_business_brain_domain_check') as McpAction;

function walkOf(pages = healthyJoineryPages()): string {
	const held = checkHeldOf(pages);
	return describeDomainCheck({ organisation, held, candidates: domainCheckCandidates(held) });
}

describe('the domain check', () => {
	it('is a read action that answers with a plain line when no domain is filed', async () => {
		filed.pages = [];
		expect(checkAction.isWrite).toBe(false);
		const answer = await checkAction.run(person, { organisationId: 'oak' });
		expect(answer).toBe(
			'**Domain check for Oak & Ash Joinery.** Nothing to check: no domain is filed for Oak & Ash Joinery yet. Offer "set the organisation domain" (start_business_brain_domain_run) instead.'
		);
	});

	it('answers with the walk and the candidates for a filed domain, saying what a missing map leaves out', async () => {
		filed.pages = withPage(healthyJoineryPages(), joineryPage('quotes', 'entity', 'Quotes'));
		const answer = await checkAction.run(person, { organisationId: 'oak' });
		expect(answer).toContain('1. **Read the domain whole** with read_business_brain_domain (organisationId oak)');
		expect(answer).toContain('No workflow map is filed, so the check cannot tell which records no task touches');
		expect(answer).toContain('   1. **Near-duplicate:** "Quote" and "Quotes" differ only by number, word order or a joining word: one concept, or two? (read Quote: quote; Quotes: quotes)');
	});

	it('reads every suspect page before judging, judges by the eight faults and files only on the person’s yes', () => {
		const walk = walkOf();
		expect(walk).toContain('It changes nothing.');
		expect(walk).toContain('Read each page a candidate names in full before judging it, and never merge pages whose text you have not compared');
		expect(walk).toContain('read_business_brain_page (organisationId org-1');
		expect(walk).toContain('**Specimens:** a page about one named client, job or machine');
		expect(walk).toContain('**Loose references:**');
		expect(walk).toContain('file it only on their yes with file_business_brain_domain (organisationId org-1)');
		expect(walk).toContain('list the retired page in retires with foldedIntoSlug naming it, in the same call: retiring is distilling');
		expect(walk).toContain('/organisations/org-1/domain');
	});

	it('says a healthy domain is a valid outcome when the site finds nothing', () => {
		const walk = walkOf();
		expect(walk).toContain('The site found no candidates.');
		expect(walk).toContain('A healthy domain is a valid outcome');
	});

	it('lists at most forty candidates and says how many more wait', () => {
		const strays = Array.from({ length: 45 }, (_, index) => joineryPage(`stray${index}`, 'value_object', `Stray${index}`, {}, 'gone'));
		const walk = walkOf([...healthyJoineryPages(), ...strays]);
		expect(walk).toContain('The site found 45 candidates:');
		expect(walk).toContain('   40. **Misfiled:**');
		expect(walk).not.toContain('   41. ');
		expect(walk).toContain('And 5 more, which the next check lists once these are judged.');
	});
});
