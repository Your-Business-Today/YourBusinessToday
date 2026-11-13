import { describe, expect, it } from 'vitest';
import { cookieRememberingInvoicesTab, rememberedInvoicesTab } from './invoicesTab';

describe('rememberedInvoicesTab', () => {
	it('opens on the tab the browser remembers', () => {
		expect(rememberedInvoicesTab('paid')).toBe('paid');
		expect(rememberedInvoicesTab('schedules')).toBe('schedules');
	});

	it('opens on Unpaid when nothing is remembered or the cookie names no tab', () => {
		expect(rememberedInvoicesTab(undefined)).toBe('unpaid');
		expect(rememberedInvoicesTab('overdue')).toBe('unpaid');
	});
});

describe('cookieRememberingInvoicesTab', () => {
	it('keeps the tab for a year on every organisation page', () => {
		expect(cookieRememberingInvoicesTab('customers')).toBe('books_invoices_tab=customers; path=/organisations; max-age=31536000; samesite=lax');
	});
});
