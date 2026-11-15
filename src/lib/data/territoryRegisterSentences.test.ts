import { describe, expect, it } from 'vitest';
import { registerNotOnMapSentence } from './territoryRegisterSentences';

describe("what a territory's page says while its map shows no register companies", () => {
	it('says nothing when companies are placed, whichever way they came to be held', () => {
		expect(registerNotOnMapSentence({ asAtMonth: '2026-11-01', companiesHeld: 25_468 })).toBeNull();
	});

	it('says a territory nobody has filled fills itself overnight, or at once through the staff member\'s Claude', () => {
		const sentence = registerNotOnMapSentence({ asAtMonth: null, companiesHeld: 0 });
		expect(sentence).toBe('No companies are loaded for this territory yet. It fills itself overnight, or at once when you ask your Claude to pull its companies.');
	});

	it('says how many companies are held when none of their postcodes is placed yet, and never to run a loader', () => {
		const sentence = registerNotOnMapSentence({ asAtMonth: null, companiesHeld: 25_468 });
		expect(sentence).toContain('25,468 companies are loaded for this territory and none is placed on the map yet.');
		expect(sentence).not.toContain('loader');
	});
});
