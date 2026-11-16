import { describe, expect, it } from 'vitest';
import { filedEmailLimits } from '$lib/data/filedEmailRules';
import { filedEmailRefusals } from './filedEmailRefusals';
import { validateFiledEmail } from './validateFiledEmail';

const clientId = '11111111-1111-4111-8111-111111111111';
const personId = '22222222-2222-4222-8222-222222222222';
const enquiry = {
	clientId,
	personId,
	mailbox: 'consulting@yourbusiness.today',
	messageId: '18c2f0a9b1d3e4f5',
	threadId: '18c2f0a9b1d3e4f0',
	direction: 'received',
	from: 'joanne@acme.example',
	to: ['consulting@yourbusiness.today'],
	subject: 'Help with our bookings',
	sentAt: '2026-11-16T09:30:00Z',
	summary: 'Asks what a booking system would cost for two sites.'
};

describe('validateFiledEmail', () => {
	it('takes an email that fits every column', () => {
		expect(validateFiledEmail(enquiry)).toEqual(enquiry);
	});

	it('takes an email with nobody named at the client, no subject and nobody listed as sent to', () => {
		const filed = validateFiledEmail({ ...enquiry, personId: '', subject: '', to: undefined });
		expect(filed).toMatchObject({ personId: null, subject: '', to: [] });
	});

	it('refuses ids that are not ids', () => {
		expect(validateFiledEmail({ ...enquiry, clientId: 'Acme' })).toContain('clientId');
		expect(validateFiledEmail({ ...enquiry, personId: 'Joanne' })).toContain('personId');
	});

	it('refuses a Gmail id that is blank, holds a space or is longer than its column', () => {
		const tooLong = 'a'.repeat(filedEmailLimits.longestGmailId + 1);
		expect(validateFiledEmail({ ...enquiry, messageId: '' })).toBe(filedEmailRefusals.messageId);
		expect(validateFiledEmail({ ...enquiry, messageId: '18c2 f0a9' })).toBe(filedEmailRefusals.messageId);
		expect(validateFiledEmail({ ...enquiry, threadId: tooLong })).toBe(filedEmailRefusals.threadId);
	});

	it('refuses a direction it does not know', () => {
		expect(validateFiledEmail({ ...enquiry, direction: 'forwarded' })).toBe(filedEmailRefusals.direction);
	});

	it('refuses addresses written with a name, rather than taking the name off them', () => {
		expect(validateFiledEmail({ ...enquiry, from: 'Joanne <joanne@acme.example>' })).toBe(filedEmailRefusals.from);
		expect(validateFiledEmail({ ...enquiry, mailbox: 'consulting' })).toBe(filedEmailRefusals.mailbox);
		expect(validateFiledEmail({ ...enquiry, to: 'consulting@yourbusiness.today' })).toBe(filedEmailRefusals.to);
		expect(validateFiledEmail({ ...enquiry, to: ['Consulting'] })).toBe(filedEmailRefusals.to);
	});

	it('refuses more recipients than the column holds', () => {
		const everyone = Array.from({ length: filedEmailLimits.mostRecipients + 1 }, (_, index) => `person${index}@acme.example`);
		expect(validateFiledEmail({ ...enquiry, to: everyone })).toBe(filedEmailRefusals.to);
	});

	it('refuses a moment with no time zone', () => {
		expect(validateFiledEmail({ ...enquiry, sentAt: '2026-11-16 09:30' })).toBe(filedEmailRefusals.sentAt);
	});

	it('refuses a subject or a summary too long, and an empty summary, never cutting them short', () => {
		const longSubject = 'a'.repeat(filedEmailLimits.longestSubject + 1);
		const longSummary = 'a'.repeat(filedEmailLimits.longestSummary + 1);
		expect(validateFiledEmail({ ...enquiry, subject: longSubject })).toBe(filedEmailRefusals.subject);
		expect(validateFiledEmail({ ...enquiry, summary: longSummary })).toBe(filedEmailRefusals.summary);
		expect(validateFiledEmail({ ...enquiry, summary: ' ' })).toBe(filedEmailRefusals.summary);
	});
});
