import { describe, expect, it } from 'vitest';
import { pdfReadingFieldRules, readPdfReadingSent } from './pdfReadingRules';

describe('reading what a Claude sends from a PDF balance sheet', () => {
	it('takes whole pounds and a real date', () => {
		expect(readPdfReadingSent('2026-03-31', '12000', '', 'https://page')).toEqual({ madeUpTo: '2026-03-31', cash: 12_000, currentAssets: null, page: 'https://page' });
	});

	it('refuses a figure written with a pound sign or commas, rather than repairing it', () => {
		expect(readPdfReadingSent('2026-03-31', '£12,000', '', 'https://page')).toBe(pdfReadingFieldRules.cash);
	});

	it('refuses a date that is not one', () => {
		expect(readPdfReadingSent('31/03/2026', '12000', '', 'https://page')).toBe(pdfReadingFieldRules.madeUpTo);
	});

	it('refuses current assets that are not whole pounds', () => {
		expect(readPdfReadingSent('2026-03-31', '12000', '45k', 'https://page')).toBe(pdfReadingFieldRules.currentAssets);
	});
});
