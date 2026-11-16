import { describe, expect, it } from 'vitest';
import { leadQuoteLimits } from '$lib/data/leadQuoteRules';
import { leadQuoteRefusals, validateLeadQuote } from './validateLeadQuote';

const clientId = '11111111-1111-4111-8111-111111111111';
const managedSolution = { name: 'Managed Solution', delivers: 'Hosting, backups and support', timing: 'From go-live', feeBasis: 'monthly', feeAmount: 2500, feeNote: '' };
const consultancy = { name: 'Consultancy by the day', feeBasis: 'daily', feeAmount: 1500 };
const quote = { clientId, title: 'The plan going forwards', preparedOn: '2026-11-17', validUntil: '2026-12-17', introduction: 'Stage by stage.', terms: 'No VAT is charged.', lines: [managedSolution, consultancy] };

describe('validateLeadQuote', () => {
	it('takes a quote that fits every column', () => {
		const filed = validateLeadQuote(quote);
		expect(filed).toMatchObject({ clientId, title: quote.title, validUntil: '2026-12-17' });
		expect(filed).toHaveProperty('lines.1', { name: consultancy.name, delivers: '', timing: '', feeBasis: 'daily', feeAmount: 1500, feeNote: '' });
	});

	it('takes a quote that stands with no end day', () => {
		expect(validateLeadQuote({ ...quote, validUntil: '' })).toMatchObject({ validUntil: null });
	});

	it('refuses a title, an introduction and terms longer than their columns, never cutting them short', () => {
		expect(validateLeadQuote({ ...quote, title: 'a'.repeat(leadQuoteLimits.longestTitle + 1) })).toBe(leadQuoteRefusals.title);
		expect(validateLeadQuote({ ...quote, title: ' ' })).toBe(leadQuoteRefusals.title);
		expect(validateLeadQuote({ ...quote, introduction: 'a'.repeat(leadQuoteLimits.longestIntroduction + 1) })).toBe(leadQuoteRefusals.introduction);
		expect(validateLeadQuote({ ...quote, terms: 'a'.repeat(leadQuoteLimits.longestTerms + 1) })).toBe(leadQuoteRefusals.terms);
	});

	it('refuses a date that is not a date, and an end before the quote was prepared', () => {
		expect(validateLeadQuote({ ...quote, preparedOn: '2026-02-30' })).toBe(leadQuoteRefusals.preparedOn);
		expect(validateLeadQuote({ ...quote, preparedOn: 'tomorrow' })).toBe(leadQuoteRefusals.preparedOn);
		expect(validateLeadQuote({ ...quote, validUntil: '17/12/2026' })).toBe(leadQuoteRefusals.validUntil);
		expect(validateLeadQuote({ ...quote, validUntil: '2026-11-16' })).toBe(leadQuoteRefusals.validUntil);
	});

	it('refuses no lines, and more lines than a quote holds', () => {
		const tooMany = Array.from({ length: leadQuoteLimits.mostLines + 1 }, () => consultancy);
		expect(validateLeadQuote({ ...quote, lines: [] })).toBe(leadQuoteRefusals.lines);
		expect(validateLeadQuote({ ...quote, lines: tooMany })).toBe(leadQuoteRefusals.lines);
		expect(validateLeadQuote({ ...quote, lines: 'Stage 1' })).toBe(leadQuoteRefusals.lines);
	});

	it('takes as many lines as a quote holds', () => {
		const asMany = Array.from({ length: leadQuoteLimits.mostLines }, () => consultancy);
		expect(validateLeadQuote({ ...quote, lines: asMany })).toHaveProperty('lines.length', leadQuoteLimits.mostLines);
	});

	it('refuses a client id that is not an id', () => {
		expect(validateLeadQuote({ ...quote, clientId: 'Conservaqua' })).toContain('clientId');
	});
});
