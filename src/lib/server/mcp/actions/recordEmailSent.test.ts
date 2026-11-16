import { beforeEach, describe, expect, it, vi } from 'vitest';
import { gmailSendingActions } from './gmailSendingActions';
import { emailSentRefusals } from '$lib/server/emailsToSend/validateEmailSent';
import { filedEmailRefusals } from '$lib/server/filedEmails/filedEmailRefusals';
import type { McpCaller } from '../resolveMcpCaller';

const clientId = '11111111-1111-4111-8111-111111111111';
const personId = '22222222-2222-4222-8222-222222222222';
const filedEmailId = '33333333-3333-4333-8333-333333333333';
const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;
const sentEmail = {
	clientId,
	personId,
	messageId: '18c2f0a9b1d3e4f9',
	threadId: '18c2f0a9b1d3e4f0',
	to: ['joanne@acme.example'],
	subject: 'Booking systems for your two sites',
	sentAt: '2026-11-16T23:30:00Z',
	summary: 'Offered a call to scope a booking system for both sites.'
};

const { gettingClient, gettingContacts, filing, logging, recordingContact } = vi.hoisted(() => ({
	gettingClient: vi.fn(),
	gettingContacts: vi.fn(),
	filing: vi.fn(),
	logging: vi.fn(),
	recordingContact: vi.fn()
}));
vi.mock('$lib/server/clients/getClient', () => ({ getClient: gettingClient }));
vi.mock('$lib/server/clients/getContactsForClient', () => ({ getContactsForClient: gettingContacts }));
vi.mock('$lib/server/filedEmails/fileEmail', () => ({ fileEmail: filing }));
vi.mock('$lib/server/leadConversations/logLeadConversation', () => ({ logLeadConversation: logging }));
vi.mock('$lib/server/emailsToSend/recordContactAfterEmail', () => ({ recordContactAfterEmail: recordingContact }));

function record(input: Record<string, unknown>) {
	const action = gmailSendingActions.find((candidate) => candidate.name === 'record_email_sent');
	return action!.run(staff, input).then(String);
}

describe('recording an email sent from the consulting inbox', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		gettingClient.mockResolvedValue({ id: clientId, name: 'Acme Ltd' });
		gettingContacts.mockResolvedValue([{ personId }]);
		filing.mockResolvedValue({ id: filedEmailId, isAlreadyFiled: false });
	});

	it('files it as sent from consulting@, logs an email conversation on its UK day and moves the person on', async () => {
		const nextStep = { nextAction: 'Call on Thursday if no reply', nextActionDue: '2026-11-19' };
		const answer = await record({ ...sentEmail, ...nextStep });
		expect(answer).toContain('Recorded under Acme Ltd');
		const filed = { ...sentEmail, mailbox: 'consulting@yourbusiness.today', from: 'consulting@yourbusiness.today', direction: 'sent' };
		expect(filing).toHaveBeenCalledWith(staff.supabase, filed, 'staff-1');
		const conversation = expect.objectContaining({ channel: 'email', heldOn: '2026-11-16', heldByAccountId: 'staff-1', personId });
		expect(logging).toHaveBeenCalledWith(staff.supabase, conversation, 'staff-1');
		expect(recordingContact).toHaveBeenCalledWith(staff.supabase, personId, '2026-11-16', nextStep);
	});

	it('records the same email once', async () => {
		filing.mockResolvedValue({ id: filedEmailId, isAlreadyFiled: true });
		expect(await record(sentEmail)).toContain('Already recorded under Acme Ltd, so nothing changed');
		expect(logging).not.toHaveBeenCalled();
		expect(recordingContact).not.toHaveBeenCalled();
	});

	it('refuses what does not fit before writing anything', async () => {
		expect(await record({ ...sentEmail, sentAt: 'tonight' })).toBe(filedEmailRefusals.sentAt);
		expect(await record({ ...sentEmail, personId: undefined, nextAction: 'Call' })).toBe(emailSentRefusals.nextStepWithoutPerson);
		expect(await record({ ...sentEmail, nextActionDue: 'Thursday' })).toContain('nextActionDue');
		gettingContacts.mockResolvedValue([]);
		expect(await record(sentEmail)).toContain('not listed at Acme Ltd');
		expect(filing).not.toHaveBeenCalled();
	});
});
