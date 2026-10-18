import { describe, expect, it } from 'vitest';
import { mostSimilar, wordsToSearch } from './similarTexts';
import { similarityLimits } from './similarWords';

const byTitle = (title: string) => [title];
const titles = ['Export the fire door register', 'Fire door photos on the job', 'Change the logo colour'];

describe('mostSimilar', () => {
	it('keeps titles sharing enough words, most shared first', () => {
		const found = mostSimilar(['Fire door register as a spreadsheet'], titles, byTitle);
		expect(found.map((scored) => scored.item)).toEqual(['Export the fire door register', 'Fire door photos on the job']);
		expect(found[0].shared).toEqual(['fire', 'door', 'register']);
	});

	it('finds nothing when too few words are shared', () => {
		expect(mostSimilar(['Logo on the invoice'], titles, byTitle)).toEqual([]);
	});

	it('finds nothing when the shared words are under half of the shorter text', () => {
		const text = 'Fire door register as a spreadsheet for every building';
		expect(mostSimilar([text], ['Photos of every fire door, penetration and ceiling void on the job'], byTitle)).toEqual([]);
	});

	it('finds nothing when two long stories share only a couple of ordinary words', () => {
		const mailboxWant = 'the office manager to file each mailbox message against its job so the director sees which items wait on a reply';
		const financeWant = 'the finance director to approve each supplier bill before payment so items are paid once and on time';
		expect(mostSimilar([mailboxWant], [financeWant], byTitle)).toEqual([]);
	});

	it('does not take two bug fixes about one thing for the same bug', () => {
		expect(mostSimilar(['invoice total is rounded up'], ['invoice PDF is missing the logo'], byTitle)).toEqual([]);
	});

	it('finds a want written in ordinary words raised again word for word', () => {
		const found = mostSimilar(['to see my own tasks'], ['to see my own tasks', 'to set my own tasks'], byTitle);
		expect(found.map((scored) => scored.item)).toEqual(['to see my own tasks']);
		expect(found[0].shared).toEqual(['see', 'own', 'tasks']);
	});

	it('finds a want with one meaningful word when only its ordinary words differ', () => {
		const found = mostSimilar(['to see the backlog'], ['to see a backlog', 'to archive the backlog'], byTitle);
		expect(found.map((scored) => scored.item)).toEqual(['to see a backlog']);
		expect(found[0].shared).toEqual(['backlog']);
	});

	it('matches on any of the texts, so a story with a title like the new one is found by its title', () => {
		const story = { title: 'Export the fire door register', want: 'the finance director to approve each supplier bill' };
		const found = mostSimilar(['Export the fire door register'], [story], (task) => [task.title, task.want]);
		expect(found.map((scored) => scored.shared)).toEqual([['export', 'fire', 'door', 'register']]);
	});

	it('shows at most a handful', () => {
		const many = Array.from({ length: similarityLimits.mostShown + 2 }, () => 'fire door');
		expect(mostSimilar(['fire door'], many, byTitle)).toHaveLength(similarityLimits.mostShown);
	});
});

describe('wordsToSearch', () => {
	it('is the meaningful words of every text, each once', () => {
		expect(wordsToSearch(['Export the register', 'the fire door register'])).toEqual(['export', 'register', 'fire', 'door']);
	});

	it('falls back to every word of a text made only of ordinary ones', () => {
		expect(wordsToSearch(['to see my own tasks'])).toEqual(['see', 'own', 'tasks']);
	});
});
