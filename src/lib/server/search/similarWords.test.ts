import { describe, expect, it } from 'vitest';
import { looksAlike, meaningfulWords, mostSimilar, similarityLimits } from './similarWords';

describe('meaningfulWords', () => {
	it('drops short and common words, and repeats', () => {
		expect(meaningfulWords('As a user I want the Fire door register, the register!')).toEqual(['fire', 'door', 'register']);
	});

	it('drops the ordinary words a story is written with', () => {
		expect(meaningfulWords('so I know which of my own items someone should see')).toEqual(['items']);
	});
});

describe('looksAlike', () => {
	it('needs at least two shared words', () => {
		expect(looksAlike(['fire', 'door'], ['fire', 'exit'])).toBe(false);
	});

	it('needs the shared words to be at least half of the shorter text', () => {
		expect(looksAlike(['fire', 'door', 'register', 'spreadsheet', 'building'], ['fire', 'door', 'photos'])).toBe(true);
		expect(looksAlike(['fire', 'door', 'register', 'spreadsheet', 'building'], ['fire', 'door', 'photos', 'ceiling', 'void'])).toBe(false);
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

	it('finds nothing when the shared words are under half of the shorter text', () => {
		const text = 'Fire door register as a spreadsheet for every building';
		expect(mostSimilar(text, ['Photos of every fire door, penetration and ceiling void on the job'], (title) => title)).toEqual([]);
	});

	it('finds nothing when two long stories share only a couple of ordinary words', () => {
		const mailboxWant = 'the office manager to file each mailbox message against its job so the director sees which items wait on a reply';
		const financeWant = 'the finance director to approve each supplier bill before payment so items are paid once and on time';
		expect(mostSimilar(mailboxWant, [financeWant], (want) => want)).toEqual([]);
	});

	it('shows at most a handful', () => {
		const many = Array.from({ length: similarityLimits.mostShown + 2 }, () => 'fire door');
		expect(mostSimilar('fire door', many, (title) => title)).toHaveLength(similarityLimits.mostShown);
	});
});
