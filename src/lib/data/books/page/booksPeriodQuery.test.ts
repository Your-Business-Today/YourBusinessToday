import { describe, expect, it } from 'vitest';
import { askedPeriodOf } from './booksPeriodQuery';
import { accountEntriesPathOf, booksPathOver } from './booksPaths';

const organisationId = 'organisation-1';

describe('askedPeriodOf', () => {
	it('reads the days the address asks for, a blank day as not asked', () => {
		expect(askedPeriodOf(new URLSearchParams('periodStart=&periodEnd=2026-06-30'))).toEqual({ periodStart: null, periodEnd: '2026-06-30' });
		expect(askedPeriodOf(new URLSearchParams())).toEqual({ periodStart: null, periodEnd: null });
	});
});

describe('the books addresses', () => {
	it('carries the span of a figure to the page of its entries', () => {
		const path = accountEntriesPathOf(organisationId, '1200', { start: '2026-04-01', end: '2026-06-30' });
		expect(path).toBe('/organisations/organisation-1/books/accounts/1200?periodStart=2026-04-01&periodEnd=2026-06-30');
	});

	it('leaves out the first day of a span from the start of the books, and escapes an account code', () => {
		const path = accountEntriesPathOf(organisationId, '12/00', { start: null, end: '2026-06-30' });
		expect(path).toBe('/organisations/organisation-1/books/accounts/12%2F00?periodEnd=2026-06-30');
		expect(booksPathOver(organisationId, { start: null, end: '2026-06-30' })).toBe('/organisations/organisation-1/books?periodEnd=2026-06-30');
	});
});
