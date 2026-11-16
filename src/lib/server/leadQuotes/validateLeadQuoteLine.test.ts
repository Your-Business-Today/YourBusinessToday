import { describe, expect, it } from 'vitest';
import { leadQuoteLimits } from '$lib/data/leadQuoteRules';
import { leadQuoteLineRefusals, validateLeadQuoteLine } from './validateLeadQuoteLine';

const callingList = { name: 'Build stage 1: Calling list', delivers: 'The ranked list', timing: '2 to 4 weeks', feeBasis: 'fixed', feeAmount: 12000.5, feeNote: '' };
const position = 3;

function refusalOf(change: Record<string, unknown>): string {
	return validateLeadQuoteLine({ ...callingList, ...change }, position) as string;
}

describe('validateLeadQuoteLine', () => {
	it('takes a line that fits every column', () => {
		expect(validateLeadQuoteLine(callingList, position)).toEqual(callingList);
	});

	it('takes a line with no amount when it has a note', () => {
		const line = validateLeadQuoteLine({ ...callingList, feeAmount: null, feeNote: 'Priced before it starts' }, position);
		expect(line).toMatchObject({ feeAmount: null, feeNote: 'Priced before it starts' });
	});

	it('refuses a line with no amount and no note, naming its place', () => {
		expect(refusalOf({ feeAmount: undefined, feeNote: '' })).toBe(`Line ${position}: ${leadQuoteLineRefusals.unpriced}`);
	});

	it('refuses a basis that is not fixed, monthly or daily', () => {
		expect(refusalOf({ feeBasis: 'yearly' })).toContain(leadQuoteLineRefusals.feeBasis);
	});

	it('refuses an amount below zero, past the column, in fractions of a penny or written as words', () => {
		expect(refusalOf({ feeAmount: -1 })).toContain(leadQuoteLineRefusals.feeAmount);
		expect(refusalOf({ feeAmount: leadQuoteLimits.largestFeeAmount + 1 })).toContain(leadQuoteLineRefusals.feeAmount);
		expect(refusalOf({ feeAmount: 10.005 })).toContain(leadQuoteLineRefusals.feeAmount);
		expect(refusalOf({ feeAmount: '£2,500' })).toContain(leadQuoteLineRefusals.feeAmount);
	});

	it('refuses each text longer than its column, never cutting it short', () => {
		expect(refusalOf({ name: 'a'.repeat(leadQuoteLimits.longestLineName + 1) })).toContain(leadQuoteLineRefusals.name);
		expect(refusalOf({ name: '' })).toContain(leadQuoteLineRefusals.name);
		expect(refusalOf({ delivers: 'a'.repeat(leadQuoteLimits.longestDelivers + 1) })).toContain(leadQuoteLineRefusals.delivers);
		expect(refusalOf({ timing: 'a'.repeat(leadQuoteLimits.longestTiming + 1) })).toContain(leadQuoteLineRefusals.timing);
		expect(refusalOf({ feeNote: 'a'.repeat(leadQuoteLimits.longestFeeNote + 1) })).toContain(leadQuoteLineRefusals.feeNote);
	});

	it('refuses a line that is not an object', () => {
		expect(validateLeadQuoteLine('Stage 1', position)).toContain(leadQuoteLineRefusals.notALine);
	});
});
