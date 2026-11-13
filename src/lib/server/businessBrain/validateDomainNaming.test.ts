import { describe, expect, it } from 'vitest';
import { coreMarkRefusal, subdomainRefusal, validateSubdomain } from './validateSubdomain';
import { namesStatusRefusal, otherNamesRefusal, validateDomainTerms } from './validateDomainTerms';
import { patternRefusal, relationshipsRefusal, validateAreaRelationships } from './validateAreaRelationships';

const signed = { word: 'signed contract stack', meaning: 'A stack the client has signed', namesThingSlug: 'contract-stack', namesStatus: 'Signed' };
const passes = { fromContextSlug: 'sales', toContextSlug: 'delivery', passes: 'The signed order', pattern: 'customer_supplier' };

describe('checking what a word names', () => {
	it('keeps a plain word as its word and meaning, and a naming word with only what it was given', () => {
		const plain = { word: 'PO', meaning: 'Purchase order', isRole: false, otherNames: [] };
		expect(validateDomainTerms([plain, { ...signed, otherNames: [' signed pack '] }], 'pages 1')).toEqual({
			terms: [{ word: 'PO', meaning: 'Purchase order' }, { ...signed, otherNames: ['signed pack'] }]
		});
		expect(validateDomainTerms([{ word: 'Client', meaning: 'Who the work is for', isRole: true }], 'pages 1')).toEqual({
			terms: [{ word: 'Client', meaning: 'Who the work is for', isRole: true }]
		});
	});

	it('refuses a status with no thing, a thing that is no slug and other names that repeat the word, by name', () => {
		const statusAlone = { word: signed.word, meaning: signed.meaning, namesStatus: signed.namesStatus };
		expect(validateDomainTerms([statusAlone], 'pages 1')).toBe(`pages 1, term 1 (signed contract stack): ${namesStatusRefusal}`);
		expect(validateDomainTerms([{ ...signed, namesThingSlug: 'Contract Stack' }], 'pages 1')).toContain('term 1 (signed contract stack): namesThingSlug.');
		expect(validateDomainTerms([{ ...signed, otherNames: ['signed contract stack'] }], 'pages 1')).toContain(otherNamesRefusal);
	});
});

describe('checking how the areas relate', () => {
	it('keeps each row as given', () => {
		expect(validateAreaRelationships([passes], 'pages 1')).toEqual({ relationships: [passes] });
		expect(validateAreaRelationships(undefined, 'pages 1')).toEqual({ relationships: [] });
	});

	it('refuses an unknown pattern, an area related to itself and a pair given twice, by name', () => {
		expect(validateAreaRelationships([{ ...passes, pattern: 'partnership' }], 'pages 1')).toBe(`pages 1, relationship 1: ${patternRefusal}`);
		expect(validateAreaRelationships([{ ...passes, toContextSlug: 'sales' }], 'pages 1')).toContain('sales relates to another context, never to itself');
		expect(validateAreaRelationships([passes, passes], 'pages 1')).toBe(`pages 1: ${relationshipsRefusal}`);
	});
});

describe('checking the part an area plays', () => {
	it('reads the core mark as the core part, and a part with no mark as itself', () => {
		expect(validateSubdomain({ isCoreDomain: true })).toEqual({ isCoreDomain: true, subdomain: 'core' });
		expect(validateSubdomain({ subdomain: 'core' })).toEqual({ isCoreDomain: true, subdomain: 'core' });
		expect(validateSubdomain({ subdomain: 'generic' })).toEqual({ isCoreDomain: false, subdomain: 'generic' });
		expect(validateSubdomain({})).toEqual({ isCoreDomain: false, subdomain: null });
	});

	it('refuses an unknown part, and a core mark on another part', () => {
		expect(validateSubdomain({ subdomain: 'central' })).toBe(subdomainRefusal);
		expect(validateSubdomain({ isCoreDomain: true, subdomain: 'supporting' })).toBe(coreMarkRefusal);
	});
});
