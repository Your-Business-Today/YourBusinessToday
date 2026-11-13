import { describe, expect, it } from 'vitest';
import { readDomainPageFacts } from './businessBrainDomainFacts';
import { groupSlugOf } from './domainGroups';
import type { DomainPage } from './organisationDomain';
import type { DomainPageKind } from './businessBrainDomain';

const lifecycle = [
	{ status: 'Found', meaning: 'A company we could work for', movesTo: ['Dropped'] },
	{ status: 'Dropped', meaning: 'Not for us', movesTo: [] }
];

function page(slug: string, kind: DomainPageKind, facts: Record<string, unknown> = {}): DomainPage {
	return { pageId: slug, parentPageId: null, kind, slug, title: slug, summary: '', facts: readDomainPageFacts(facts) };
}

describe('reading what a record says of itself', () => {
	it('reads a page filed before records said more as saying none of it', () => {
		const facts = readDomainPageFacts({ fields: [], statuses: ['Open', 'Paid'], aggregateRootSlug: null });
		expect(facts).toMatchObject({ statuses: ['Open', 'Paid'], identity: null, lifecycle: [], keptIn: null, memberSlugs: [] });
	});

	it('reads a lifecycle with its moves, what makes one and where it is kept', () => {
		const facts = readDomainPageFacts({ statuses: ['Found', 'Dropped'], lifecycle, identity: 'One company', keptIn: 'The Leads register' });
		expect(facts).toMatchObject({ statuses: ['Found', 'Dropped'], lifecycle, identity: 'One company', keptIn: 'The Leads register' });
	});

	it('takes the statuses from the lifecycle when none are listed, and leaves out a row with no status', () => {
		const facts = readDomainPageFacts({ lifecycle: [...lifecycle, { meaning: 'No status' }, { status: 'Won', movesTo: 'Lost' }] });
		expect(facts.statuses).toEqual(['Found', 'Dropped', 'Won']);
		expect(facts.lifecycle[2]).toEqual({ status: 'Won', meaning: '', movesTo: [] });
	});
});

describe('groupSlugOf', () => {
	const leadGroup = page('lead-group', 'aggregate', { aggregateRootSlug: 'lead', memberSlugs: ['conversation-log'] });
	const pages = [page('lead', 'entity'), page('conversation-log', 'entity'), leadGroup];

	it('names the group that lists a record as a member or as its root', () => {
		expect(groupSlugOf(pages, 'conversation-log')).toBe('lead-group');
		expect(groupSlugOf(pages, 'lead')).toBe('lead-group');
	});

	it('names no group for a record no group names, or for the group itself', () => {
		expect(groupSlugOf([...pages, page('invoice', 'entity')], 'invoice')).toBeNull();
		expect(groupSlugOf(pages, 'lead-group')).toBeNull();
	});
});
