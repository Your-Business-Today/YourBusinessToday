import { describe, expect, it } from 'vitest';
import { byMostNeeded, countCoverage, coverageStateOf, type SectorCoverage } from './sectorCoverage';
import { validateSectorSearch } from './sectorSearchRules';

const today = new Date('2026-10-12T09:00:00Z');

describe('coverageStateOf', () => {
	it('is unsearched until a person records a search, claimed while someone holds it, and stale after ninety days', () => {
		expect(coverageStateOf(null, null, today)).toBe('unsearched');
		expect(coverageStateOf(null, 'account-1', today)).toBe('claimed');
		expect(coverageStateOf('2026-10-01T09:00:00Z', null, today)).toBe('searched');
		expect(coverageStateOf('2026-06-01T09:00:00Z', null, today)).toBe('stale');
	});
});

describe('countCoverage and byMostNeeded', () => {
	const coverage: SectorCoverage[] = [
		{ sector: 'KT1 1', state: 'searched', latestSearchedAt: '2026-10-01T09:00:00Z', searchCount: 2, claimedByAccountId: null },
		{ sector: 'KT1 2', state: 'unsearched', latestSearchedAt: null, searchCount: 0, claimedByAccountId: null },
		{ sector: 'KT1 3', state: 'stale', latestSearchedAt: '2026-01-01T09:00:00Z', searchCount: 1, claimedByAccountId: null }
	];

	it('counts each state and puts the never-searched sector first, then the longest ago', () => {
		expect(countCoverage(coverage)).toEqual({ unsearched: 1, claimed: 0, searched: 1, stale: 1, total: 3 });
		expect([...coverage].sort(byMostNeeded).map((entry) => entry.sector)).toEqual(['KT1 2', 'KT1 3', 'KT1 1']);
	});
});

describe('validateSectorSearch', () => {
	it('refuses an empty summary, an unknown source and a negative count rather than repairing them', () => {
		const good = { sector: 'KT1 1', source: 'open_web', foundCount: 12, summary: '12 found, 4 on the register' };
		expect(validateSectorSearch(good)).toBeNull();
		expect(validateSectorSearch({ ...good, summary: '' })).toContain('one line');
		expect(validateSectorSearch({ ...good, source: 'linkedin' })).toContain('The source is one of');
		expect(validateSectorSearch({ ...good, foundCount: -1 })).toContain('whole number');
		expect(validateSectorSearch({ ...good, sector: '' })).toContain('sector is required');
	});
});
