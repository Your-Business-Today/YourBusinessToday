import { describe, expect, it } from 'vitest';
import { emptyVocabulary, isVocabularyFiled, phraseMeaningOf } from './phraseInDomain';
import { glossaryJoinVocabulary as vocabulary } from './tests/glossaryJoinMap';

describe('phraseMeaningOf', () => {
	it("finds a thing by its title or its slug, whatever the casing", () => {
		expect(phraseMeaningOf(vocabulary, ' work ORDER ')).toEqual({ thingSlug: 'work-order', status: null, isRole: false });
		expect(phraseMeaningOf(vocabulary, 'work-order')).toEqual({ thingSlug: 'work-order', status: null, isRole: false });
	});

	it('finds a word that names a record in a status', () => {
		expect(phraseMeaningOf(vocabulary, 'sent invoice')).toEqual({ thingSlug: 'invoice', status: 'sent', isRole: false });
	});

	it('finds a word by one of its other names', () => {
		expect(phraseMeaningOf(vocabulary, 'Subcontractor firm')).toEqual({ thingSlug: 'subcontractor', status: null, isRole: false });
		expect(phraseMeaningOf(vocabulary, 'qs')).toEqual({ thingSlug: null, status: null, isRole: true });
	});

	it('finds a word that names nothing further, and nothing for a phrase in neither', () => {
		expect(phraseMeaningOf(vocabulary, 'Retention')).toEqual({ thingSlug: null, status: null, isRole: false });
		expect(phraseMeaningOf(vocabulary, 'Payment reminder')).toBeNull();
	});
});

describe('isVocabularyFiled', () => {
	it('is false before any thing or word is filed', () => {
		expect(isVocabularyFiled(emptyVocabulary)).toBe(false);
		expect(isVocabularyFiled(vocabulary)).toBe(true);
	});
});
