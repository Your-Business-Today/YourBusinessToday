import { beforeEach, describe, expect, it, vi } from 'vitest';
import { gmailSendingActions } from './gmailSendingActions';
import { emailRequestRefusals } from '$lib/server/emailsToSend/validateEmailRequest';
import { noSuchClient } from './describeClient';
import type { McpCaller } from '../resolveMcpCaller';

const clientId = '11111111-1111-4111-8111-111111111111';
const personId = '22222222-2222-4222-8222-222222222222';
const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;
const joanne = { personId, name: 'Joanne Price', email: 'joanne@acme.example', role: 'Office manager' };
const approachNote = { kind: 'approach', createdAt: '2026-11-15T10:00:00Z', body: 'Opening message: we build booking systems.' };

const { gettingClient, gettingContacts, gettingNotes, gettingEmails, gettingConversations } = vi.hoisted(() => ({
	gettingClient: vi.fn(),
	gettingContacts: vi.fn(),
	gettingNotes: vi.fn(),
	gettingEmails: vi.fn(),
	gettingConversations: vi.fn()
}));
vi.mock('$lib/server/clients/getClient', () => ({ getClient: gettingClient }));
vi.mock('$lib/server/clients/getContactsForClient', () => ({ getContactsForClient: gettingContacts }));
vi.mock('$lib/server/people/getNotesForPeople', () => ({ getNotesForPeople: gettingNotes }));
vi.mock('$lib/server/filedEmails/getEmailsForClient', () => ({ getEmailsForClient: gettingEmails }));
vi.mock('$lib/server/leadConversations/getConversationsForClient', () => ({ getConversationsForClient: gettingConversations }));

function prepare(input: Record<string, unknown>) {
	const action = gmailSendingActions.find((candidate) => candidate.name === 'prepare_email');
	return action!.run(staff, input).then(String);
}

describe('preparing an email from the consulting inbox, drafts first', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		gettingClient.mockResolvedValue({ id: clientId, name: 'Acme Ltd' });
		gettingContacts.mockResolvedValue([joanne]);
		gettingNotes.mockResolvedValue([approachNote]);
		gettingEmails.mockResolvedValue([]);
		gettingConversations.mockResolvedValue([]);
	});

	it('gives the address, the saved approach and the steps that send only on a yes', async () => {
		const answer = await prepare({ clientId, personId, purpose: 'approach' });
		expect(answer).toContain('From: consulting@yourbusiness.today, through Gmail');
		expect(answer).toContain('To: Joanne Price <joanne@acme.example>, Office manager, at Acme Ltd');
		expect(answer).toContain('we build booking systems');
		expect(answer).toContain('Send it only on their yes in this chat');
		expect(answer).toContain('Never send in bulk');
	});

	it('writes to the main contact when nobody is named, and leaves the approach out of a follow-up', async () => {
		const answer = await prepare({ clientId, purpose: 'follow_up' });
		expect(answer).toContain('Joanne Price');
		expect(answer).not.toContain('Saved approach');
	});

	it('puts a reply in the thread it answers, and refuses a reply with no thread', async () => {
		expect(await prepare({ clientId, purpose: 'reply', threadId: '18c2f0a9b1d3e4f0' })).toContain('Reply in Gmail thread: 18c2f0a9b1d3e4f0');
		expect(await prepare({ clientId, purpose: 'reply' })).toBe(emailRequestRefusals.replyWithoutThread);
	});

	it('refuses a purpose it does not know before reading anything', async () => {
		expect(await prepare({ clientId, purpose: 'newsletter' })).toBe(emailRequestRefusals.purpose);
		expect(gettingClient).not.toHaveBeenCalled();
	});

	it('says when there is no client, nobody to write to, or no address for them', async () => {
		gettingContacts.mockResolvedValue([{ ...joanne, email: '' }]);
		expect(await prepare({ clientId, purpose: 'other' })).toContain('No email address is held for Joanne Price');
		expect(await prepare({ clientId, personId: clientId, purpose: 'other' })).toContain('not listed at Acme Ltd');
		gettingContacts.mockResolvedValue([]);
		expect(await prepare({ clientId, purpose: 'other' })).toContain('Nobody is listed at Acme Ltd');
		gettingClient.mockResolvedValue(null);
		expect(await prepare({ clientId, purpose: 'other' })).toBe(noSuchClient);
	});
});
