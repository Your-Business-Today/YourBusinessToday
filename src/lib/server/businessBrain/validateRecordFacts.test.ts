import { describe, expect, it } from 'vitest';
import { validateDomainFiling } from './validateDomainFiling';
import { membersOnGroupRefusal } from './validateRecordFacts';
import { statusesOfLifecycleRefusal } from './validateLifecycle';

const source = { sourceTitle: 'Sales handbook', sourceOrigin: 'SharePoint: Sales.docx' };
const lifecycle = [
	{ status: 'Found', meaning: 'A company we could work for', movesTo: ['Introduced', 'Dropped'] },
	{ status: 'Introduced', meaning: 'Met at a first meeting', movesTo: ['Dropped'] },
	{ status: 'Dropped', meaning: 'Not for us' }
];
const lead = { kind: 'entity', slug: 'lead', title: 'Lead', summary: 'A company we might work for', body: 'A lead is…', contextSlug: 'winning-clients' };
const leadGroup = { ...lead, kind: 'aggregate', slug: 'lead-group', title: 'Lead and its log', aggregateRootSlug: 'lead', memberSlugs: ['conversation-log'] };

function filed(pages: Record<string, unknown>[]) {
	return validateDomainFiling({ ...source, pages });
}

function factsOf(page: Record<string, unknown>) {
	const filing = filed([page]);
	if (typeof filing === 'string') throw new Error(filing);
	return filing.pages[0].facts;
}

describe('filing what makes a record, its lifecycle and where it is kept', () => {
	it('keeps a lifecycle with its moves, and takes the statuses from it', () => {
		const facts = factsOf({ ...lead, lifecycle, identity: ' One company, by its registered number ', keptIn: 'The Leads register' });
		expect(facts).toEqual({
			fields: [],
			statuses: ['Found', 'Introduced', 'Dropped'],
			aggregateRootSlug: null,
			identity: 'One company, by its registered number',
			lifecycle: [...lifecycle.slice(0, 2), { ...lifecycle[2], movesTo: [] }],
			keptIn: 'The Leads register'
		});
	});

	it('keeps a record filed as before with only its fields, statuses and root', () => {
		expect(factsOf({ ...lead, statuses: ['Found'] })).toEqual({ fields: [], statuses: ['Found'], aggregateRootSlug: null });
	});

	it('takes statuses given beside the lifecycle only when they are the lifecycle’s', () => {
		expect(factsOf({ ...lead, lifecycle, statuses: ['Found', 'Introduced', 'Dropped'] })).toMatchObject({ statuses: ['Found', 'Introduced', 'Dropped'] });
		expect(filed([{ ...lead, lifecycle, statuses: ['Found'] }])).toBe(`pages 1: ${statusesOfLifecycleRefusal}`);
	});

	it('refuses a move to a status the lifecycle does not have, by name', () => {
		const stray = [{ status: 'Found', movesTo: ['Won'] }];
		expect(filed([{ ...lead, lifecycle: stray }])).toBe('pages 1, lifecycle (Found): it moves to Won, which is no status of this lifecycle; its statuses are Found.');
	});

	it('refuses a status named as the record, in the lifecycle or the statuses', () => {
		expect(filed([{ ...lead, lifecycle: [{ status: 'lead' }] }])).toContain('pages 1, lifecycle: "lead" is the record’s own name');
		expect(filed([{ ...lead, statuses: ['Found', 'Lead'] }])).toContain('pages 1: "Lead" is the record’s own name');
	});

	it('refuses a status given twice and a move that is not a list', () => {
		expect(filed([{ ...lead, lifecycle: [{ status: 'Found' }, { status: 'Found' }] }])).toContain('the status Found is given twice');
		expect(filed([{ ...lead, lifecycle: [{ status: 'Found', movesTo: 'Dropped' }] }])).toContain('pages 1, lifecycle 1 (Found): movesTo is a list');
	});
});

describe('filing a group’s members', () => {
	it('keeps the members a group names beside its root', () => {
		expect(factsOf(leadGroup)).toEqual({ fields: [], statuses: [], aggregateRootSlug: 'lead', memberSlugs: ['conversation-log'] });
	});

	it('refuses members on anything but a group, and a group naming itself', () => {
		expect(filed([{ ...lead, memberSlugs: ['conversation-log'] }])).toBe(`pages 1: ${membersOnGroupRefusal}`);
		expect(filed([{ ...leadGroup, memberSlugs: ['lead-group'] }])).toContain('pages 1: memberSlugs names the records and details');
	});
});
