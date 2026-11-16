import { describe, expect, it } from 'vitest';
import { describeLatestQuote, describeLeadQuote } from './describeLeadQuote';
import type { LeadQuote } from '$lib/data/leadQuoteRules';

const quote: LeadQuote = {
	id: 'quote-2',
	version: 2,
	title: 'The plan going forwards',
	preparedOn: '2026-11-17',
	validUntil: null,
	introduction: '',
	terms: 'No VAT is charged.',
	filedAt: '2026-11-17T10:00:00Z',
	lines: [
		{ name: 'Build stage 1: Calling list', delivers: 'The ranked list', timing: '2 to 4 weeks', feeBasis: 'fixed', feeAmount: 12000, feeNote: '' },
		{ name: 'Managed Solution', delivers: '', timing: '', feeBasis: 'monthly', feeAmount: 2500, feeNote: '' },
		{ name: 'Site Care', delivers: '', timing: '', feeBasis: 'monthly', feeAmount: 150, feeNote: 'per site' },
		{ name: 'Build stage 2', delivers: '', timing: '', feeBasis: 'fixed', feeAmount: null, feeNote: 'Priced before it starts' },
		{ name: 'Consultancy by the day', delivers: '', timing: '', feeBasis: 'daily', feeAmount: 1500, feeNote: '' }
	]
};
const versions = [
	{ version: 2, title: quote.title, filedAt: quote.filedAt },
	{ version: 1, title: quote.title, filedAt: '2026-11-16T10:00:00Z' }
];

describe('describeLeadQuote', () => {
	it('adds the fixed fees and the monthly fees, and lists the day rates without adding them', () => {
		const answer = describeLeadQuote('Conservaqua', quote, versions);
		expect(answer).toContain('To build: £12,000.00. Each month: £2,650.00. Day rates: Consultancy by the day £1,500.00 a day.');
	});

	it('gives every line in order with its fee, and the version among those filed', () => {
		const answer = describeLeadQuote('Conservaqua', quote, versions);
		expect(answer).toContain('Conservaqua: The plan going forwards, version 2 of 2, prepared 2026-11-17');
		expect(answer).toContain('1. Build stage 1: Calling list — The ranked list — 2 to 4 weeks — £12,000.00 fixed');
		expect(answer).toContain('4. Build stage 2 — Priced before it starts');
		expect(answer).toContain('3. Site Care — £150.00 a month (per site)');
	});

	it('names the latest quote and its totals in one line for read_client, or says none is filed', () => {
		expect(describeLatestQuote(quote)).toContain('Quote: The plan going forwards, version 2');
		expect(describeLatestQuote(null)).toContain('file_lead_quote');
	});
});
