import { describe, expect, it } from 'vitest';
import { glossaryJoinMap as map, glossaryJoinVocabulary as vocabulary } from './tests/glossaryJoinMap';
import { linesNotWords, phrasesNotWords, stationsUsingWord, thingsOnNoStation } from './mapDomainJoin';
import { thingStationsOf } from './thingStations';

const [sentInvoice, subbie, quantitySurveyor, retention] = vocabulary.words;

describe('the join between the map and the domain', () => {
	it('lists the phrases and the lines that are neither a thing nor a word', () => {
		expect(phrasesNotWords(map, vocabulary)).toEqual(['Payment reminder']);
		expect(linesNotWords(map, vocabulary)).toEqual(['Office']);
	});

	it('finds the things on no station', () => {
		const unplaced = thingsOnNoStation(vocabulary.things, thingStationsOf(map, vocabulary));
		expect(unplaced.map((thing) => thing.slug)).toEqual(['variation']);
	});

	it('counts the stations that use each word, a role word counting the stations on its line', () => {
		expect(stationsUsingWord(map, sentInvoice)).toBe(2);
		expect(stationsUsingWord(map, subbie)).toBe(1);
		expect(stationsUsingWord(map, quantitySurveyor)).toBe(2);
		expect(stationsUsingWord(map, retention)).toBe(0);
		expect(stationsUsingWord(null, sentInvoice)).toBe(0);
	});
});
