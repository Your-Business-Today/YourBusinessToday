import { describe, expect, it } from 'vitest';
import { meaningfulWords, mostSimilar, similarityLimits } from './similarWords';

describe('meaningfulWords', () => {
	it('drops short and common words, and repeats', () => {
		expect(meaningfulWords('As a user I want the Fire door register, the register!')).toEqual(['fire', 'door', 'register']);
	});
});

describe('mostSimilar', () => {
	const titles = ['Export the fire door register', 'Fire door photos on the job', 'Change the logo colour'];

	it('keeps titles sharing enough words, most shared first', () => {
		const found = mostSimilar('Fire door register as a spreadsheet', titles, (title) => title);
		expect(found.map((scored) => scored.item)).toEqual(['Export the fire door register', 'Fire door photos on the job']);
		expect(found[0].shared).toEqual(['fire', 'door', 'register']);
	});

	it('finds nothing when too few words are shared', () => {
		expect(mostSimilar('Logo on the invoice', titles, (title) => title)).toEqual([]);
	});

	it('shows at most a handful', () => {
		const many = Array.from({ length: similarityLimits.mostShown + 2 }, () => 'fire door');
		expect(mostSimilar('fire door', many, (title) => title)).toHaveLength(similarityLimits.mostShown);
	});
});
