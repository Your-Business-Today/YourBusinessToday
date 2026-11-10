import { describe, expect, it } from 'vitest';
import { readDeadlinesEmailRequest } from './deadlinesEmailRequest';

function deadlinesForm(fields: Record<string, string>): FormData {
	const formData = new FormData();
	const allFields = { email: 'Ada@Example.com', taxYear: '2026/27', ...fields };
	for (const [fieldName, value] of Object.entries(allFields)) formData.set(fieldName, value);
	return formData;
}

describe('readDeadlinesEmailRequest', () => {
	it('carries only the address and the tax year when the estimate was not ticked', () => {
		const reading = readDeadlinesEmailRequest(deadlinesForm({}));
		expect(reading).toEqual({ request: { email: 'ada@example.com', taxYear: '2026/27', estimate: null } });
	});

	it('carries the figures when the person ticked to include their estimate', () => {
		const reading = readDeadlinesEmailRequest(deadlinesForm({ takeHome: '41234.56', selfAssessmentBill: '3000.00' }));
		const estimate = { takeHome: 41234.56, selfAssessmentBill: 3000, paymentOnAccount: null };
		expect(reading).toEqual({ request: { email: 'ada@example.com', taxYear: '2026/27', estimate } });
	});

	it('refuses an address that is not shaped like one', () => {
		expect(readDeadlinesEmailRequest(deadlinesForm({ email: 'ada' }))).toHaveProperty('problem');
	});

	it('refuses an address longer than an email address can be', () => {
		const overlongAddress = `${'a'.repeat(250)}@example.com`;
		expect(readDeadlinesEmailRequest(deadlinesForm({ email: overlongAddress }))).toHaveProperty('problem');
	});

	it('refuses a tax year the calculator does not cover', () => {
		expect(readDeadlinesEmailRequest(deadlinesForm({ taxYear: '2019/20' }))).toHaveProperty('problem');
	});

	it('refuses a figure with more than pence, naming it, rather than rounding it', () => {
		const reading = readDeadlinesEmailRequest(deadlinesForm({ takeHome: '100.123' }));
		expect(reading).toEqual({ problem: 'Take-home for the year must be an amount in pounds and pence.' });
	});

	it('refuses a figure past the largest amount', () => {
		const reading = readDeadlinesEmailRequest(deadlinesForm({ takeHome: '100000000.01' }));
		expect(reading).toHaveProperty('problem');
	});

	it('treats a filled honeypot as a robot', () => {
		expect(readDeadlinesEmailRequest(deadlinesForm({ nickname: 'bot' }))).toEqual({ isHoneypotFilled: true });
	});
});
