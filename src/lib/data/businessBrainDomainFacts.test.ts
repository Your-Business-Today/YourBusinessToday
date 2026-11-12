import { describe, expect, it } from 'vitest';
import { readDomainPageFacts } from './businessBrainDomainFacts';

describe('readDomainPageFacts', () => {
	it('reads a page with no domain facts as holding none', () => {
		expect(readDomainPageFacts({})).toEqual({ isCoreDomain: false, fields: [], statuses: [], aggregateRootSlug: null });
		expect(readDomainPageFacts(null).fields).toEqual([]);
	});

	it('leaves out a field with no name and fills a field’s label from its name', () => {
		const facts = readDomainPageFacts({ fields: [{ type: 'text' }, { name: 'total', type: 'money' }] });
		expect(facts.fields).toEqual([{ name: 'total', label: 'total', type: 'money', ref: null, isRequired: false, notes: '' }]);
	});
});
