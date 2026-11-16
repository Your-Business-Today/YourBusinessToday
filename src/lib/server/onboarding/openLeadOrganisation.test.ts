import { beforeEach, describe, expect, it, vi } from 'vitest';

const doubles = vi.hoisted(() => ({
	getClient: vi.fn(),
	setOrganisationModule: vi.fn(),
	inviteSetUpPerson: vi.fn(),
	findOrganisationLinkById: vi.fn(),
	findOrganisationLinkOfClient: vi.fn(),
	findTopOrganisationNamed: vi.fn(),
	linkOrganisationToClient: vi.fn(),
	createOrganisationForClient: vi.fn()
}));

vi.mock('$lib/server/payments/supabaseServiceClient', () => ({ supabaseServiceClient: () => ({}) }));
vi.mock('$lib/server/clients/getClient', () => ({ getClient: doubles.getClient }));
vi.mock('$lib/server/organisations/setOrganisationModule', () => ({ setOrganisationModule: doubles.setOrganisationModule }));
vi.mock('./inviteSetUpPerson', () => ({ inviteSetUpPerson: doubles.inviteSetUpPerson }));
vi.mock('./leadOrganisationRows', () => ({
	findOrganisationLinkById: doubles.findOrganisationLinkById,
	findOrganisationLinkOfClient: doubles.findOrganisationLinkOfClient,
	findTopOrganisationNamed: doubles.findTopOrganisationNamed,
	linkOrganisationToClient: doubles.linkOrganisationToClient,
	createOrganisationForClient: doubles.createOrganisationForClient
}));

const { openLeadOrganisation } = await import('./openLeadOrganisation');

const company = { id: 'client-1', name: 'Conservaqua' };
const ownOrganisation = { id: 'organisation-1', name: 'Conservaqua', clientId: 'client-1' };
const unlinkedNamesake = { id: 'organisation-1', name: 'Conservaqua', clientId: null };
const takenNamesake = { id: 'organisation-2', name: 'Conservaqua', clientId: 'client-2' };
const request = { clientId: 'client-1', organisationId: null, actorAccountId: 'staff-1' };

describe('opening a lead’s own organisation before it signs', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		doubles.getClient.mockResolvedValue(company);
		doubles.findOrganisationLinkOfClient.mockResolvedValue(null);
		doubles.findTopOrganisationNamed.mockResolvedValue(null);
		doubles.linkOrganisationToClient.mockResolvedValue(ownOrganisation);
		doubles.createOrganisationForClient.mockResolvedValue(ownOrganisation);
	});

	it('gives back the organisation already linked, making nothing', async () => {
		doubles.findOrganisationLinkOfClient.mockResolvedValue(ownOrganisation);
		const opened = await openLeadOrganisation(request);
		expect(opened).toEqual({ organisation: ownOrganisation, opening: 'already linked', companyName: 'Conservaqua' });
		expect(doubles.linkOrganisationToClient).not.toHaveBeenCalled();
		expect(doubles.createOrganisationForClient).not.toHaveBeenCalled();
	});

	it('links the organisation of its exact name that is linked to nothing', async () => {
		doubles.findTopOrganisationNamed.mockResolvedValue(unlinkedNamesake);
		const opened = await openLeadOrganisation(request);
		expect(doubles.findTopOrganisationNamed).toHaveBeenCalledWith({}, 'Conservaqua');
		expect(doubles.linkOrganisationToClient).toHaveBeenCalledWith({}, 'organisation-1', 'client-1');
		expect(opened).toMatchObject({ opening: 'linked' });
		expect(doubles.createOrganisationForClient).not.toHaveBeenCalled();
	});

	it('creates one in the company’s name when none carries it', async () => {
		const opened = await openLeadOrganisation(request);
		expect(doubles.createOrganisationForClient).toHaveBeenCalledWith({}, 'Conservaqua', 'client-1', 'staff-1');
		expect(opened).toMatchObject({ opening: 'created' });
	});

	it('refuses when the name is held by an organisation linked to another company', async () => {
		doubles.findTopOrganisationNamed.mockResolvedValue(takenNamesake);
		const opened = await openLeadOrganisation(request);
		expect(opened).toEqual({ refusal: expect.stringContaining('already linked to another company') });
		expect(doubles.linkOrganisationToClient).not.toHaveBeenCalled();
		expect(doubles.setOrganisationModule).not.toHaveBeenCalled();
	});

	it('switches Your Business Brain on for the organisation it opens', async () => {
		await openLeadOrganisation(request);
		expect(doubles.setOrganisationModule).toHaveBeenCalledWith({}, {
			organisationId: 'organisation-1',
			module: 'business_brain',
			isOn: true,
			switchedBy: 'staff-1'
		});
	});

	it('invites nobody', async () => {
		await openLeadOrganisation(request);
		expect(doubles.inviteSetUpPerson).not.toHaveBeenCalled();
	});

	it('refuses a company nobody has', async () => {
		doubles.getClient.mockResolvedValue(null);
		expect(await openLeadOrganisation(request)).toEqual({ refusal: expect.stringContaining('No company on the register') });
	});
});
