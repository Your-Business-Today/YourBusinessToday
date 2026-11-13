import { describe, expect, it } from 'vitest';
import { emptyVocabulary } from '$lib/data/workflowMap/phraseInDomain';
import { glossaryJoinMap, glossaryJoinVocabulary } from '$lib/data/workflowMap/tests/glossaryJoinMap';
import { lineColoursOf } from './workflowLineMap';
import { stationDetailsOf } from './stationDetails';

const surroundings = { earlierMap: null, colours: lineColoursOf([glossaryJoinMap]), productNames: {}, vocabulary: glossaryJoinVocabulary };

describe('the station panel, read through the glossary', () => {
	it('shows the things a station touches with no slugs filed, with the status its word names', () => {
		const details = stationDetailsOf(glossaryJoinMap, surroundings, 'bill-client');
		expect(details?.things).toEqual([
			{ slug: 'work-order', name: 'Work order', status: null },
			{ slug: 'invoice', name: 'Invoice', status: 'sent' }
		]);
		expect(details?.phrasesNotWords).toEqual([]);
	});

	it('marks the phrase the glossary does not hold', () => {
		const details = stationDetailsOf(glossaryJoinMap, surroundings, 'chase-payment');
		expect(details?.phrasesNotWords).toEqual(['Payment reminder']);
	});

	it('marks nothing while no domain is filed', () => {
		const details = stationDetailsOf(glossaryJoinMap, { ...surroundings, vocabulary: emptyVocabulary }, 'chase-payment');
		expect(details?.phrasesNotWords).toEqual([]);
		expect(details?.things).toEqual([{ slug: 'invoice', name: 'Invoice', status: null }]);
	});
});
