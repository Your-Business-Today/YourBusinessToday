import { describe, expect, it } from 'vitest';
import { firstDomainFilingGap } from './domainFilingGaps';
import { readDomainPageFacts } from '$lib/data/businessBrainDomainFacts';
import type { DomainFilingGiven, DomainPageWriteGiven } from '$lib/data/businessBrainDomainRules';
import type { DomainPage } from '$lib/data/organisationDomain';
import type { DomainPageKind } from '$lib/data/businessBrainDomain';

function filed(slug: string, kind: DomainPageKind, facts: Record<string, unknown> = {}): DomainPage {
	return { pageId: `page-${slug}`, parentPageId: null, kind, slug, title: slug, summary: '', facts: readDomainPageFacts(facts) };
}

function group(slug: string, memberSlugs: string[]): DomainPageWriteGiven {
	const facts = { fields: [], statuses: [], aggregateRootSlug: 'lead', memberSlugs };
	return { kind: 'aggregate', slug, title: slug, summary: '', body: 'What changes together', contextSlug: 'winning-clients', facts };
}

function filing(pages: DomainPageWriteGiven[]): DomainFilingGiven {
	return { source: { title: 'Handbook' } as DomainFilingGiven['source'], contexts: [], pages, retires: [] };
}

const winningClients = filed('winning-clients', 'bounded_context');
const conversationLog = filed('conversation-log', 'entity');

describe('the members a group names', () => {
	it('lets a group name a record filed before', () => {
		expect(firstDomainFilingGap(filing([group('lead-group', ['conversation-log'])]), [winningClients, conversationLog])).toBeNull();
	});

	it('names a member the domain does not hold', () => {
		const gap = firstDomainFilingGap(filing([group('lead-group', ['meeting-note'])]), [winningClients, conversationLog]);
		expect(gap).toEqual({ groupSlug: 'lead-group', unknownMemberSlug: 'meeting-note' });
	});

	it('does not take a rule or a glossary for a member', () => {
		const gap = firstDomainFilingGap(filing([group('lead-group', ['a-rule'])]), [winningClients, filed('a-rule', 'rule')]);
		expect(gap).toEqual({ groupSlug: 'lead-group', unknownMemberSlug: 'a-rule' });
	});

	it('names a record made a member of a second group, filed before or in the same call', () => {
		const otherGroup = filed('client-group', 'aggregate', { memberSlugs: ['conversation-log'] });
		const twoGroups = { memberSlug: 'conversation-log', groupSlugs: ['client-group', 'lead-group'] };
		expect(firstDomainFilingGap(filing([group('lead-group', ['conversation-log'])]), [winningClients, conversationLog, otherGroup])).toEqual(twoGroups);
		const bothWritten = filing([group('client-group', ['conversation-log']), group('lead-group', ['conversation-log'])]);
		expect(firstDomainFilingGap(bothWritten, [winningClients, conversationLog])).toEqual(twoGroups);
	});

	it('lets a group revised in this call take a member from what it named before', () => {
		const before = filed('lead-group', 'aggregate', { memberSlugs: ['conversation-log'] });
		expect(firstDomainFilingGap(filing([group('lead-group', [])]), [winningClients, conversationLog, before])).toBeNull();
	});
});
