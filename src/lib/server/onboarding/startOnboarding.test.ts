import { beforeEach, describe, expect, it, vi } from 'vitest';

const doubles = vi.hoisted(() => ({
	getContactsForAccount: vi.fn(),
	isOrganisationNameTaken: vi.fn(),
	findClientWithOrganisationNamed: vi.fn(),
	addSignUpLead: vi.fn(),
	organisationForClient: vi.fn(),
	addOrganisationMember: vi.fn(),
	onboardingProjectFor: vi.fn()
}));

vi.mock('$lib/server/payments/supabaseServiceClient', () => ({
	supabaseServiceClient: () => ({})
}));
vi.mock('$lib/server/clients/getContactsForClient', () => ({
	getContactsForAccount: doubles.getContactsForAccount
}));
vi.mock('./organisationForClient', () => ({
	isOrganisationNameTaken: doubles.isOrganisationNameTaken,
	findClientWithOrganisationNamed: doubles.findClientWithOrganisationNamed,
	organisationForClient: doubles.organisationForClient
}));
vi.mock('./addSignUpLead', () => ({ addSignUpLead: doubles.addSignUpLead }));
vi.mock('$lib/server/organisations/addOrganisationMember', () => ({
	addOrganisationMember: doubles.addOrganisationMember
}));
vi.mock('./onboardingProjectFor', () => ({ onboardingProjectFor: doubles.onboardingProjectFor }));

const { businessNameTaken, startOnboarding } = await import('./startOnboarding');

const signUp = { businessName: 'Acme Joinery', personName: 'Sam Smith' };
const account = { accountId: 'account-1', emailAddress: 'sam@acme.example' };
const onboardingPlace = {
	organisationId: 'organisation-1',
	clientId: 'client-1',
	accountId: 'account-1'
};

describe('a visitor signing up', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		doubles.getContactsForAccount.mockResolvedValue([]);
		doubles.findClientWithOrganisationNamed.mockResolvedValue(null);
		doubles.isOrganisationNameTaken.mockResolvedValue(false);
		doubles.addSignUpLead.mockResolvedValue('client-1');
		doubles.organisationForClient.mockResolvedValue('organisation-1');
	});

	it('makes the lead, the organisation with them as manager, and the Onboarding project', async () => {
		expect(await startOnboarding(signUp, account)).toEqual({ clientId: 'client-1' });
		expect(doubles.addSignUpLead).toHaveBeenCalledOnce();
		expect(doubles.addOrganisationMember).toHaveBeenCalledWith(
			{},
			{
				organisationId: 'organisation-1',
				accountId: 'account-1',
				isManager: true,
				addedBy: 'account-1'
			}
		);
		expect(doubles.onboardingProjectFor).toHaveBeenCalledWith({}, onboardingPlace);
	});

	it('makes no second client when the account already signed this business up', async () => {
		doubles.getContactsForAccount.mockResolvedValue([{ clientId: 'client-1' }]);
		doubles.findClientWithOrganisationNamed.mockResolvedValue('client-1');
		expect(await startOnboarding(signUp, account)).toEqual({ clientId: 'client-1' });
		expect(doubles.addSignUpLead).not.toHaveBeenCalled();
		expect(doubles.onboardingProjectFor).toHaveBeenCalledWith({}, onboardingPlace);
	});

	it('signs up a new business for someone already a contact at another organisation', async () => {
		doubles.getContactsForAccount.mockResolvedValue([{ clientId: 'client-elsewhere' }]);
		expect(await startOnboarding(signUp, account)).toEqual({ clientId: 'client-1' });
		expect(doubles.addSignUpLead).toHaveBeenCalledOnce();
	});

	it('is refused, with nothing made, when an organisation already has the business’s name', async () => {
		doubles.isOrganisationNameTaken.mockResolvedValue(true);
		expect(await startOnboarding(signUp, account)).toEqual(businessNameTaken);
		expect(doubles.addSignUpLead).not.toHaveBeenCalled();
		expect(doubles.addOrganisationMember).not.toHaveBeenCalled();
	});
});
