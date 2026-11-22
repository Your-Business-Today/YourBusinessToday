import { describe, expect, it } from 'vitest';
import { excerptAsMarkdown, excerptPartsOf } from './libraryExcerpt';

describe('the words around a search match', () => {
	it('tells the matched words apart from the rest', () => {
		expect(excerptPartsOf('send the settlement «reports» each month')).toEqual([
			{ words: 'send the settlement ', isMatch: false },
			{ words: 'reports', isMatch: true },
			{ words: ' each month', isMatch: false }
		]);
	});

	it('takes the Markdown marks out of a written document and runs its lines together', () => {
		const parts = excerptPartsOf('guide # «Reports»\n\nEach **«report»** you upload');
		expect(parts.map(({ words }) => words).join('')).toBe('guide Reports Each report you upload');
		expect(parts.filter(({ isMatch }) => isMatch).map(({ words }) => words)).toEqual(['Reports', 'report']);
	});

	it('gives nothing for an empty excerpt', () => {
		expect(excerptPartsOf('')).toEqual([]);
	});

	it('reads as Markdown for a Claude, the matches in bold', () => {
		expect(excerptAsMarkdown(excerptPartsOf('how to «sign» in'))).toBe('how to **sign** in');
	});
});
