import { describe, expect, it } from 'vitest';
import { plainDomainTerm } from './domainTermFacts';
import { readDomainPageFacts } from './businessBrainDomainFacts';

describe('readDomainPageFacts', () => {
	it('reads a page with no domain facts as holding none', () => {
		const noRecordFacts = { identity: null, lifecycle: [], keptIn: null, memberSlugs: [] };
		const noKindFacts = { fields: [], statuses: [], aggregateRootSlug: null, governs: [], terms: [], relationships: [], assumed: [] };
		const noEventFacts = { marksThingSlug: null, marksStatus: null, reactors: { roles: [], ruleSlugs: [] } };
		const noRuleFacts = { ruleKind: null, guardsStationKeys: [], guardsThingSlug: null, guardsStatus: null, followsEventSlug: null, definesWord: null };
		const noFacts = { isCoreDomain: false, subdomain: null, ...noKindFacts, ...noRecordFacts, ...noEventFacts, ...noRuleFacts };
		expect(readDomainPageFacts({})).toEqual(noFacts);
		expect(readDomainPageFacts(null).fields).toEqual([]);
	});

	it('leaves out a field with no name and fills a field’s label from its name', () => {
		const facts = readDomainPageFacts({ fields: [{ type: 'text' }, { name: 'total', type: 'money' }] });
		expect(facts.fields).toEqual([{ name: 'total', label: 'total', type: 'money', ref: null, isRequired: false, notes: '' }]);
	});

	it('reads the things a rule governs and the words a glossary lists, leaving out a word with no meaning', () => {
		const facts = readDomainPageFacts({ governs: ['job', 7], terms: [{ word: 'PVR', meaning: 'Programme valuation report' }, { word: 'RFI' }] });
		expect(facts.governs).toEqual(['job']);
		expect(facts.terms).toEqual([plainDomainTerm('PVR', 'Programme valuation report')]);
	});

	it('reads what a word names, its other names and whether it is a role, and a status only beside the thing it is of', () => {
		const naming = { namesThingSlug: 'contract-stack', namesStatus: 'Signed', otherNames: ['signed pack', 3] };
		const signed = { word: 'signed contract stack', meaning: 'A stack the client has signed', ...naming };
		const client = { word: 'client', meaning: 'Who the work is for', isRole: true, namesStatus: 'Signed' };
		const [signedRead, clientRead] = readDomainPageFacts({ terms: [signed, client] }).terms;
		expect(signedRead).toEqual({ ...signed, isRole: false, otherNames: ['signed pack'] });
		expect(clientRead).toEqual({ ...plainDomainTerm('client', 'Who the work is for'), isRole: true });
	});

	it('reads an area’s part, the core mark winning, and leaves an area filed before parts as having none', () => {
		expect(readDomainPageFacts({ isCoreDomain: true, subdomain: 'generic' }).subdomain).toBe('core');
		expect(readDomainPageFacts({ subdomain: 'supporting' }).subdomain).toBe('supporting');
		expect(readDomainPageFacts({ subdomain: 'core' }).subdomain).toBeNull();
		expect(readDomainPageFacts({ isCoreDomain: false }).subdomain).toBeNull();
	});

	it('reads how the areas relate, leaving out a row with no known pattern', () => {
		const passes = { fromContextSlug: 'sales', toContextSlug: 'delivery', passes: 'The signed order', pattern: 'customer_supplier' };
		const facts = readDomainPageFacts({ relationships: [passes, { ...passes, pattern: 'partnership' }, 'sales'] });
		expect(facts.relationships).toEqual([passes]);
	});
});
