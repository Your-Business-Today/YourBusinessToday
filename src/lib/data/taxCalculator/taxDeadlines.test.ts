import { describe, expect, it } from 'vitest';
import { deadlinesStillAhead, taxDeadlinesFor } from './taxDeadlines';
import { taxYearNames, taxYearRules } from './taxYearRules';

const govUkPage = /^https:\/\/www\.gov\.uk\//;

function dueDatesFor(taxYear: '2025/26' | '2026/27'): string[] {
	const deadlines = taxDeadlinesFor(taxYearRules[taxYear]);
	return deadlines.map((deadline) => deadline.dueOn);
}

describe('taxDeadlinesFor', () => {
	it('lists the 2025/26 Self Assessment dates gov.uk gives, in date order', () => {
		expect(dueDatesFor('2025/26')).toEqual(['2026-10-05', '2026-10-31', '2026-12-30', '2027-01-31', '2027-07-31']);
	});

	it('adds the four Making Tax Digital quarterly updates from 2026/27, the first year it applies', () => {
		expect(dueDatesFor('2026/27')).toEqual([
			'2026-08-07',
			'2026-11-07',
			'2027-02-07',
			'2027-05-07',
			'2027-10-05',
			'2027-10-31',
			'2027-12-30',
			'2028-01-31',
			'2028-07-31'
		]);
	});

	it.each(taxYearNames)('cites a gov.uk page for every %s deadline', (taxYear) => {
		const deadlines = taxDeadlinesFor(taxYearRules[taxYear]);
		deadlines.forEach((deadline) => expect(deadline.sourceUrl).toMatch(govUkPage));
	});

	it('names the period each quarterly update covers', () => {
		const deadlines = taxDeadlinesFor(taxYearRules['2026/27']);
		const firstUpdate = deadlines[0];
		expect(firstUpdate.detail).toContain('6 April 2026 to 5 July 2026');
	});
});

describe('deadlinesStillAhead', () => {
	it('keeps a deadline that falls today and drops the ones already gone', () => {
		const deadlines = taxDeadlinesFor(taxYearRules['2026/27']);
		const stillAhead = deadlinesStillAhead(deadlines, new Date(2026, 10, 7, 15, 0));
		const firstDueDate = stillAhead[0].dueOn;
		expect(firstDueDate).toBe('2026-11-07');
		expect(stillAhead).toHaveLength(8);
	});
});
