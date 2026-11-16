import { beforeEach, describe, expect, it, vi } from 'vitest';
import { filedEmailActions, noSuchFiledEmail } from './filedEmailActions';
import { filedEmailRefusals } from '$lib/server/filedEmails/filedEmailRefusals';
import { noSuchClient } from './describeClient';
import type { McpCaller } from '../resolveMcpCaller';

const clientId = '11111111-1111-4111-8111-111111111111';
const personId = '22222222-2222-4222-8222-222222222222';
const filedEmailId = '33333333-3333-4333-8333-333333333333';
const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;
const acme = { id: clientId, name: 'Acme Ltd' };
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

const { gettingClient, gettingContacts, filing, unfiling } = vi.hoisted(() => ({
	gettingClient: vi.fn(),
	gettingContacts: vi.fn(),
	filing: vi.fn(),
	unfiling: vi.fn()
}));
vi.mock('$lib/server/clients/getClient', () => ({ getClient: gettingClient }));
vi.mock('$lib/server/clients/getContactsForClient', () => ({ getContactsForClient: gettingContacts }));
vi.mock('$lib/server/filedEmails/fileEmail', () => ({ fileEmail: filing }));
vi.mock('$lib/server/filedEmails/unfileEmail', () => ({ unfileEmail: unfiling }));

function run(actionName: string, input: Record<string, unknown>) {
	const action = filedEmailActions.find((candidate) => candidate.name === actionName);
	return action!.run(staff, input);
}

describe('filing an email under a client through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		gettingClient.mockResolvedValue(acme);
		gettingContacts.mockResolvedValue([{ personId }]);
		filing.mockResolvedValue({ id: filedEmailId, isAlreadyFiled: false });
	});

	it('files the email under the client as the caller, and asks for the Gmail label', async () => {
		const answer = String(await run('file_email_to_client', enquiry));
		expect(answer).toContain('Filed under Acme Ltd');
		expect(answer).toContain(filedEmailId);
		expect(answer).toContain('YBT/Acme Ltd');
		expect(filing).toHaveBeenCalledWith(staff.supabase, enquiry, 'staff-1');
	});

	it('keeps the one already filed when the same email is filed again', async () => {
		filing.mockResolvedValue({ id: filedEmailId, isAlreadyFiled: true });
		expect(await run('file_email_to_client', enquiry)).toContain('Already filed under Acme Ltd, so nothing changed');
	});

	it('refuses what does not fit before reading anything, and a client or person it cannot find', async () => {
		expect(await run('file_email_to_client', { ...enquiry, sentAt: 'Monday' })).toBe(filedEmailRefusals.sentAt);
		expect(gettingClient).not.toHaveBeenCalled();
		gettingContacts.mockResolvedValue([]);
		expect(await run('file_email_to_client', enquiry)).toContain('not listed at Acme Ltd');
		gettingClient.mockResolvedValue(null);
		expect(await run('file_email_to_client', enquiry)).toBe(noSuchClient);
		expect(filing).not.toHaveBeenCalled();
	});
});

describe('unfiling an email through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		gettingClient.mockResolvedValue(acme);
	});

	it('takes the email off its client and asks for the Gmail label to go too', async () => {
		unfiling.mockResolvedValue(clientId);
		expect(await run('unfile_email', { filedEmailId })).toContain('Taken off Acme Ltd');
		expect(unfiling).toHaveBeenCalledWith(staff.supabase, filedEmailId);
	});

	it('refuses an id that is not one, and says when no such filing is held', async () => {
		expect(await run('unfile_email', { filedEmailId: 'the Acme one' })).toContain('filedEmailId');
		unfiling.mockResolvedValue(null);
		expect(await run('unfile_email', { filedEmailId })).toBe(noSuchFiledEmail);
	});
});
