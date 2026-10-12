import { describe, expect, it } from 'vitest';
import { describeFiledFigures, formatPounds, validateFiledFigures } from './filedFigures';

const figures = { netAssets: 84_200, cash: 12_000, creditors: 31_499, averageEmployees: 4, madeUpTo: '2026-03-31', sourceUrl: '' };

describe('filed figures', () => {
	it('describes the figures in one line and leaves out what was not filed', () => {
		expect(describeFiledFigures(figures)).toBe('Net assets £84k · cash £12k · creditors £31k · 4 employees · to 31 Mar 2026');
		expect(describeFiledFigures({ ...figures, cash: null, averageEmployees: 1 })).toBe('Net assets £84k · creditors £31k · 1 employee · to 31 Mar 2026');
	});

	it('formats pounds in thousands and millions', () => {
		expect(formatPounds(950)).toBe('£950');
		expect(formatPounds(-2_500_000)).toBe('-£2.5m');
		expect(formatPounds(12_000_000)).toBe('£12m');
	});

	it('refuses a misread figure or headcount', () => {
		expect(validateFiledFigures(figures)).toBeNull();
		expect(validateFiledFigures({ ...figures, netAssets: 1e15 })).toContain('misread');
		expect(validateFiledFigures({ ...figures, averageEmployees: 2.5 })).toContain('headcount');
	});
});
