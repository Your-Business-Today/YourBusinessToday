import { describe, expect, it } from 'vitest';
import { readDomainPageFacts } from './businessBrainDomainFacts';

describe('readDomainPageFacts', () => {
	it('reads a page with no domain facts as holding none', () => {
		expect(readDomainPageFacts({})).toEqual({ isCoreDomain: false, fields: [], statuses: [], aggregateRootSlug: null, governs: [], terms: [] });
		expect(readDomainPageFacts(null).fields).toEqual([]);
	});

	it('leaves out a field with no name and fills a field’s label from its name', () => {
		const facts = readDomainPageFacts({ fields: [{ type: 'text' }, { name: 'total', type: 'money' }] });
		expect(facts.fields).toEqual([{ name: 'total', label: 'total', type: 'money', ref: null, isRequired: false, notes: '' }]);
	});

	it('reads the things a rule governs and the words a glossary lists, leaving out a word with no meaning', () => {
		const facts = readDomainPageFacts({ governs: ['job', 7], terms: [{ word: 'PVR', meaning: 'Programme valuation report' }, { word: 'RFI' }] });
		expect(facts.governs).toEqual(['job']);
		expect(facts.terms).toEqual([{ word: 'PVR', meaning: 'Programme valuation report' }]);
	});
});
