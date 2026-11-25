import { describe, expect, it } from 'vitest';
import { leftMonthRefusal, memberMonthsRefusal, monthsCoveredRefusal, spellsOverlap } from './costShareRules';

describe('monthsCoveredRefusal', () => {
	it('takes a whole number of months from 1 to 36', () => {
		expect(monthsCoveredRefusal(12)).toBeNull();
		expect(monthsCoveredRefusal(1)).toBeNull();
		expect(monthsCoveredRefusal(0)).toContain('from 1 to 36');
		expect(monthsCoveredRefusal(37)).toContain('from 1 to 36');
		expect(monthsCoveredRefusal(1.5)).toContain('whole number');
		expect(monthsCoveredRefusal('12')).toContain('whole number');
	});
});

describe('memberMonthsRefusal', () => {
	it('takes a real month to join, and a month to leave no earlier, or none', () => {
		expect(memberMonthsRefusal('2026-07', null)).toBeNull();
		expect(memberMonthsRefusal('2026-07', '2026-07')).toBeNull();
		expect(memberMonthsRefusal('July', null)).toContain('joinedMonth');
		expect(leftMonthRefusal('2026-07', '2026-06')).toContain('cannot come before');
	});
});

describe('spellsOverlap', () => {
	it('finds a month two spells share, and none when one ends before the other starts', () => {
		expect(spellsOverlap({ joinedMonth: '2026-01', leftMonth: '2026-06' }, { joinedMonth: '2026-06', leftMonth: null })).toBe(true);
		expect(spellsOverlap({ joinedMonth: '2026-01', leftMonth: '2026-05' }, { joinedMonth: '2026-06', leftMonth: null })).toBe(false);
		expect(spellsOverlap({ joinedMonth: '2026-09', leftMonth: null }, { joinedMonth: '2026-01', leftMonth: null })).toBe(true);
	});
});
