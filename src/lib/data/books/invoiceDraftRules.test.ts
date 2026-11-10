import { describe, expect, it } from 'vitest';
import { dueDateRefusal, validateInvoiceDraftChange, validateNewInvoiceDraft } from './invoiceDraftRules';

const customerId = '00000000-0000-4000-8000-00000000c0a1';
const salesId = '00000000-0000-4000-8000-000000004000';
const websiteBuild = { description: 'Website build', quantity: 2, unitPrice: 500, incomeAccountId: salesId };

describe('validateNewInvoiceDraft', () => {
	it('keeps the draft as given, leaving the dates for the books to fill and the rest at their column defaults', () => {
		expect(validateNewInvoiceDraft({ customerId, lines: [websiteBuild] })).toEqual({
			customerId,
			issueDate: null,
			dueDate: null,
			reference: '',
			notes: '',
			lines: [{ ...websiteBuild, costCentreId: null }]
		});
	});

	it('refuses a draft with no customer or no lines', () => {
		expect(validateNewInvoiceDraft({ lines: [websiteBuild] })).toBe('customerId is needed: it is who the invoice is made out to.');
		expect(validateNewInvoiceDraft({ customerId, lines: [] })).toBe('lines is a list of at least one invoice line.');
	});

	it('refuses a line it would have to repair, naming the line and the field', () => {
		const lines = (line: Record<string, unknown>) => ({ customerId, lines: [websiteBuild, { ...websiteBuild, ...line }] });
		expect(validateNewInvoiceDraft(lines({ quantity: 0 }))).toBe('Line 2 quantity is above zero; 0 was given.');
		expect(validateNewInvoiceDraft(lines({ unitPrice: 10.005 }))).toBe('Line 2 unitPrice has at most 2 decimal places; 10.005 was given.');
		expect(validateNewInvoiceDraft(lines({ description: ' ' }))).toBe('Line 2 description says what the line is for, in the words the person gave.');
		expect(validateNewInvoiceDraft(lines({ incomeAccountId: 'Sales' }))).toContain('The Line 2 income account must be an id');
		expect(validateNewInvoiceDraft(lines({ costCentreId: 'Projects' }))).toContain('The Line 2 cost centre must be an id');
	});

	it('refuses a date that is not a day and a reference that is not text', () => {
		expect(validateNewInvoiceDraft({ customerId, issueDate: '2026-02-30', lines: [websiteBuild] })).toBe('issueDate is not a day on the calendar; 2026-02-30 was given.');
		expect(validateNewInvoiceDraft({ customerId, reference: 12, lines: [websiteBuild] })).toBe('reference is text; 12 was given.');
	});
});

describe('validateInvoiceDraftChange', () => {
	it('keeps only what was given', () => {
		expect(validateInvoiceDraftChange({ invoiceId: 'x', reference: 'PO 12' })).toEqual({ reference: 'PO 12' });
		expect(validateInvoiceDraftChange({ lines: [websiteBuild] })).toEqual({ lines: [{ ...websiteBuild, costCentreId: null }] });
	});

	it('refuses a change with nothing in it', () => {
		expect(validateInvoiceDraftChange({ invoiceId: 'x' })).toContain('No change was given.');
	});
});

describe('dueDateRefusal', () => {
	it('lets an invoice fall due on or after its issue, never before', () => {
		expect(dueDateRefusal('2026-11-10', '2026-11-10')).toBeNull();
		expect(dueDateRefusal('2026-11-10', '2026-11-09')).toBe(
			'dueDate 2026-11-09 is before issueDate 2026-11-10; an invoice falls due on or after the day it is issued.'
		);
	});
});
