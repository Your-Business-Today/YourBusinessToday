import { beforeEach, describe, expect, it, vi } from 'vitest';

const doubles = vi.hoisted(() => ({
	getClient: vi.fn(),
	countContactInvitesThisHour: vi.fn(),
	organisationForClient: vi.fn(),
	onboardingProjectFor: vi.fn(),
	inviteSetUpPerson: vi.fn(),
	recordClientEvent: vi.fn()
}));

vi.mock('$lib/server/payments/supabaseServiceClient', () => ({ supabaseServiceClient: () => ({}) }));
vi.mock('$lib/server/clients/getClient', () => ({ getClient: doubles.getClient }));
vi.mock('$lib/server/clients/recentContactInviteCount', () => ({
	countContactInvitesThisHour: doubles.countContactInvitesThisHour
}));
vi.mock('./organisationForClient', () => ({ organisationForClient: doubles.organisationForClient }));
vi.mock('./onboardingProjectFor', () => ({ onboardingProjectFor: doubles.onboardingProjectFor }));
vi.mock('./inviteSetUpPerson', () => ({ inviteSetUpPerson: doubles.inviteSetUpPerson }));
vi.mock('$lib/server/clients/recordClientEvent', () => ({ recordClientEvent: doubles.recordClientEvent }));

const { noClientToSetUp, setClientUp } = await import('./setClientUp');
const { mostInvitesPerHour } = await import('$lib/server/email/inviteAllowance');

const sam = { name: 'Sam Smith', email: 'sam@acme.example' };
const alex = { name: 'Alex Jones', email: 'alex@acme.example' };
const request = { clientId: 'client-1', people: [sam, alex], origin: 'https://ybt.example', actorAccountId: 'admin-1' };

describe('an administrator setting a client up', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		doubles.getClient.mockResolvedValue({ id: 'client-1', name: 'Acme Joinery' });
		doubles.countContactInvitesThisHour.mockResolvedValue(0);
		doubles.organisationForClient.mockResolvedValue('organisation-1');
		doubles.inviteSetUpPerson.mockImplementation(async (_place, person) => ({ ...person, delivery: 'sent' }));
	});

	it('makes the organisation and Onboarding project on the client already on the register', async () => {
		await setClientUp(request);
		expect(doubles.organisationForClient).toHaveBeenCalledWith({}, 'client-1', 'Acme Joinery', 'admin-1');
		expect(doubles.onboardingProjectFor).toHaveBeenCalledWith({}, {
			organisationId: 'organisation-1',
			clientId: 'client-1',
			accountId: 'admin-1'
		});
	});

	it('invites each person in turn, the first as the organisation’s manager', async () => {
		const setUp = await setClientUp(request);
		expect(doubles.inviteSetUpPerson).toHaveBeenNthCalledWith(1, expect.anything(), sam, true);
		expect(doubles.inviteSetUpPerson).toHaveBeenNthCalledWith(2, expect.anything(), alex, false);
		expect(setUp).toEqual({
			organisationName: 'Acme Joinery',
			invitations: [{ ...sam, delivery: 'sent' }, { ...alex, delivery: 'sent' }]
		});
	});

	it('records the set-up on the client’s history', async () => {
		await setClientUp(request);
		const detail = { organisation: 'Acme Joinery', people: [sam.email, alex.email] };
		expect(doubles.recordClientEvent).toHaveBeenCalledWith({}, 'client-1', 'client_set_up', detail, 'admin-1');
	});

	it('makes nothing for a client not on the register', async () => {
		doubles.getClient.mockResolvedValue(null);
		expect(await setClientUp(request)).toEqual(noClientToSetUp);
		expect(doubles.organisationForClient).not.toHaveBeenCalled();
	});

	it('makes nothing when the invitations would pass the hour’s allowance', async () => {
		doubles.countContactInvitesThisHour.mockResolvedValue(mostInvitesPerHour - 1);
		expect(await setClientUp(request)).toHaveProperty('refusal');
		expect(doubles.organisationForClient).not.toHaveBeenCalled();
	});

	it('invites nobody when another organisation already has the client’s name', async () => {
		doubles.organisationForClient.mockResolvedValue(null);
		expect(await setClientUp(request)).toHaveProperty('refusal');
		expect(doubles.inviteSetUpPerson).not.toHaveBeenCalled();
		expect(doubles.recordClientEvent).not.toHaveBeenCalled();
	});
});
