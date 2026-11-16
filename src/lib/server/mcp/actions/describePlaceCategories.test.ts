import { describe, expect, it } from 'vitest';
import { describePlaceCategories } from './describePlaceCategories';

const estateAgents = { name: 'real_estate_agent', placeCount: 149, withPhoneCount: 141 };
const unfiled = { name: '', placeCount: 870, withPhoneCount: 700 };

describe("a territory's categories of trading place, as a Claude reads them", () => {
	it('starts each line with the word list_patch_premises takes, then how many trade there and how many list a phone number', () => {
		const answer = describePlaceCategories({ categories: [estateAgents], matchedCount: 1 }, false);
		expect(answer).toBe('real_estate_agent — 149 trading place(s) — 141 with a phone number');
	});

	it('says so where the places state no category', () => {
		const [line] = describePlaceCategories({ categories: [unfiled, estateAgents], matchedCount: 2 }, false).split('\n');
		expect(line).toBe('no category stated — 870 trading place(s) — 700 with a phone number');
	});

	it('says how many more categories fit when the answer is cut short', () => {
		const lines = describePlaceCategories({ categories: [estateAgents], matchedCount: 817 }, false).split('\n');
		expect(lines.at(-1)).toBe('… and 816 more categories — give a word, such as agent or salon, to narrow.');
	});

	it('says how to load the places when the territory holds none yet', () => {
		expect(describePlaceCategories({ categories: [], matchedCount: 0 }, false)).toContain('load_patch_places loads them now');
	});

	it('says a category is in the singular when the word asked for fits none', () => {
		const answer = describePlaceCategories({ categories: [], matchedCount: 0 }, true);
		expect(answer).toContain('No category of trading place in this territory contains that word');
		expect(answer).toContain('real_estate_agent');
	});
});
