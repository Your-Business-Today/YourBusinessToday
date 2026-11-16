import { describe, expect, it } from 'vitest';
import { describeFiledEmails, describeTaskEmails } from './describeFiledEmails';
import type { FiledEmail } from '$lib/data/filedEmailRules';

const enquiry: FiledEmail = {
	id: 'filed-1',
	personId: 'person-1',
	personName: 'Joanne Price',
	mailbox: 'consulting@yourbusiness.today',
	messageId: 'm1',
	threadId: 't1',
	direction: 'received',
	from: 'joanne@acme.example',
	to: ['consulting@yourbusiness.today'],
	subject: 'Help with our bookings',
	sentAt: '2026-11-16T09:30:00+00:00',
	summary: 'Asks what a booking system would cost.',
	filedAt: '2026-11-16T10:00:00+00:00'
};

describe('describeFiledEmails', () => {
	it('says none are filed yet and how to file one', () => {
		expect(describeFiledEmails([])[0]).toContain('file_email_to_client');
	});

	it('gives each email its sender, subject, summary, id and the link that opens it in Gmail', () => {
		const lines = describeFiledEmails([enquiry]);
		expect(lines[0]).toBe('- 2026-11-16T09:30:00+00:00, Received, from joanne@acme.example (Joanne Price): "Help with our bookings" — filed email filed-1');
		expect(lines[1]).toContain(enquiry.summary);
		expect(lines[2]).toContain('#all/t1');
	});

	it('says when an email had no subject', () => {
		expect(describeFiledEmails([{ ...enquiry, subject: '' }])[0]).toContain('(no subject)');
	});
});

describe('describeTaskEmails', () => {
	it('says when no email is filed against the task', () => {
		expect(describeTaskEmails([])).toEqual(['Emails: none filed against it.']);
	});

	it('lists the emails filed against the task under a heading, each with its Gmail link', () => {
		const lines = describeTaskEmails([enquiry]);
		expect(lines[0]).toBe('Emails filed against it, the latest first:');
		expect(lines[1]).toContain('"Help with our bookings" — filed email filed-1');
		expect(lines[3]).toContain('#all/t1');
	});
});
