import { describe, expect, it } from 'vitest';
import { checkCampaignPlan } from './checkCampaignPlan';

const autumn = { name: 'Autumn', objective: 'purchase', budgetPounds: 500, startsOn: '2026-10-01', endsOn: '2026-10-31' };

function problemOf(input: Record<string, unknown>): string {
	const check = checkCampaignPlan(input);
	return 'problem' in check ? check.problem : '';
}

describe('checking a campaign against its columns', () => {
	it('keeps the budget in whole pence and the dates as given', () => {
		expect(checkCampaignPlan({ ...autumn, budgetPounds: '120.50' })).toEqual({
			plan: { name: 'Autumn', objective: 'purchase', budgetPence: 12050, startsOn: '2026-10-01', endsOn: '2026-10-31' }
		});
	});

	it('lets a campaign start and end on the same day, and cost nothing', () => {
		expect(checkCampaignPlan({ ...autumn, budgetPounds: 0, endsOn: '2026-10-01' })).toHaveProperty('plan');
	});

	it('refuses a budget below zero, or with parts of a penny, rather than repair it', () => {
		expect(problemOf({ ...autumn, budgetPounds: -1 })).toBe('budgetPounds cannot be below zero; -1 was given');
		expect(problemOf({ ...autumn, budgetPounds: 10.005 })).toContain('at most 2 decimal places');
		expect(problemOf({ ...autumn, budgetPounds: 'lots' })).toContain('an amount in pounds');
	});

	it('refuses a campaign that ends before it starts', () => {
		expect(problemOf({ ...autumn, endsOn: '2026-09-30' })).toContain('endsOn 2026-09-30 is before startsOn 2026-10-01');
	});

	it('refuses a day that is not on the calendar, or not written as a date', () => {
		expect(problemOf({ ...autumn, startsOn: '2026-02-30' })).toContain('not a day on the calendar');
		expect(problemOf({ ...autumn, endsOn: 'next week' })).toContain('endsOn is a date written as 2026-11-30');
	});

	it('refuses an objective the audience cannot do, and a name that is empty or too long', () => {
		expect(problemOf({ ...autumn, objective: 'reach' })).toContain('objective is the audience action');
		expect(problemOf({ ...autumn, name: '  ' })).toContain('name is empty');
		expect(problemOf({ ...autumn, name: 'a'.repeat(121) })).toBe('name is 121 characters; keep it to 120');
	});
});
