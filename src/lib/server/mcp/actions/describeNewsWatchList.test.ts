import { describe, expect, it } from 'vitest';
import { describeNewsWatchList } from './describeNewsWatchList';

const fireDoors = { id: 'watched-1', kind: 'word' as const, value: 'fire door', label: '' };
const jewel = { kind: 'company' as const, value: '01234567', label: 'Jewel Enterprises' };

describe('describeNewsWatchList', () => {
	it('lists each watched thing with its id, and says when nothing is watched', () => {
		expect(describeNewsWatchList('Jewel', [fireDoors], [])).toBe("What Jewel's Business News watches:\n- Word: fire door, id watched-1");
		expect(describeNewsWatchList('Jewel', [], [])).toBe("What Jewel's Business News watches:\nIt watches nothing yet.");
	});

	it('offers the suggestions after the list, said not to be watched yet', () => {
		const answer = describeNewsWatchList('Jewel', [], [jewel]);
		expect(answer).toContain('not watched until added with add_to_news_watch_list');
		expect(answer).toContain('- Company: 01234567 (Jewel Enterprises)');
	});
});
