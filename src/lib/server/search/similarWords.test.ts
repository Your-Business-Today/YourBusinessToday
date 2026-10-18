import { describe, expect, it } from 'vitest';
import { distinctWords, looksAlike, meaningfulWords, saysTheSame } from './similarWords';

describe('distinctWords', () => {
	it('keeps every word once, in lower case, ordinary ones included', () => {
		expect(distinctWords('As a user I want the Fire door register, the register!')).toEqual(['user', 'want', 'the', 'fire', 'door', 'register']);
	});
});

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

describe('saysTheSame', () => {
	it('is true for the very same words in any order', () => {
		expect(saysTheSame(['see', 'own', 'tasks'], ['tasks', 'own', 'see'])).toBe(true);
	});

	it('is false when a word differs, and for two empty texts', () => {
		expect(saysTheSame(['see', 'own', 'tasks'], ['set', 'own', 'tasks'])).toBe(false);
		expect(saysTheSame(['backlog'], ['backlog', 'archive'])).toBe(false);
		expect(saysTheSame([], [])).toBe(false);
	});
});
