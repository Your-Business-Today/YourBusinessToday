import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { McpCaller } from '../resolveMcpCaller';

const doubles = vi.hoisted(() => ({
	getClient: vi.fn(),
	setOrganisationModule: vi.fn(),
	findOrganisationLinkById: vi.fn(),
	findOrganisationLinkOfClient: vi.fn(),
	findTopOrganisationNamed: vi.fn(),
	linkOrganisationToClient: vi.fn(),
	createOrganisationForClient: vi.fn()
}));

vi.mock('$lib/server/payments/supabaseServiceClient', () => ({ supabaseServiceClient: () => ({}) }));
vi.mock('$lib/server/clients/getClient', () => ({ getClient: doubles.getClient }));
vi.mock('$lib/server/organisations/setOrganisationModule', () => ({ setOrganisationModule: doubles.setOrganisationModule }));
vi.mock('$lib/server/onboarding/leadOrganisationRows', () => ({
	findOrganisationLinkById: doubles.findOrganisationLinkById,
	findOrganisationLinkOfClient: doubles.findOrganisationLinkOfClient,
	findTopOrganisationNamed: doubles.findTopOrganisationNamed,
	linkOrganisationToClient: doubles.linkOrganisationToClient,
	createOrganisationForClient: doubles.createOrganisationForClient
}));

const { leadOrganisationActions } = await import('./leadOrganisationActions');

const leadId = '11111111-1111-4111-8111-111111111111';
const organisationId = '33333333-3333-4333-8333-333333333333';
const otherOrganisationId = '44444444-4444-4444-8444-444444444444';
const lead = { id: leadId, name: 'Coinbserve Aqua' };
const unlinked = { id: organisationId, name: 'Conservaqua', clientId: null };
const linkedToLead = { ...unlinked, clientId: leadId };
const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;

function run(input: Record<string, unknown>) {
	const [openOrganisation] = leadOrganisationActions;
	return openOrganisation.run(staff, input);
}

describe('opening a lead’s organisation through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		doubles.getClient.mockResolvedValue(lead);
		doubles.findOrganisationLinkOfClient.mockResolvedValue(null);
		doubles.findOrganisationLinkById.mockResolvedValue(unlinked);
		doubles.linkOrganisationToClient.mockResolvedValue(linkedToLead);
	});

	it('is a staff write on the clients area', () => {
		const [openOrganisation] = leadOrganisationActions;
		expect(openOrganisation).toMatchObject({ name: 'open_lead_organisation', area: 'clients', audience: 'staff', isWrite: true });
	});

	it('links a named organisation whatever its name, and names what comes next', async () => {
		const answer = await run({ clientId: leadId, organisationId });
		expect(doubles.linkOrganisationToClient).toHaveBeenCalledWith({}, organisationId, leadId);
		expect(answer).toContain(`Coinbserve Aqua's organisation is Conservaqua (id ${organisationId}), linked.`);
		expect(answer).toContain('Nobody was invited.');
		for (const next of ['file_business_brain_domain', 'file_workflow_map', 'read_workflow_map']) expect(answer).toContain(next);
	});

	it('refuses a named organisation already linked to another company', async () => {
		doubles.findOrganisationLinkById.mockResolvedValue({ ...unlinked, clientId: 'client-2' });
		expect(await run({ clientId: leadId, organisationId })).toContain('already linked to another company');
		expect(doubles.linkOrganisationToClient).not.toHaveBeenCalled();
	});

	it('refuses a named organisation when the company already has a different one', async () => {
		doubles.findOrganisationLinkOfClient.mockResolvedValue({ ...linkedToLead, id: otherOrganisationId });
		expect(await run({ clientId: leadId, organisationId })).toContain('already has its own organisation');
		expect(doubles.linkOrganisationToClient).not.toHaveBeenCalled();
	});

	it('refuses ids that are not ids before reading anything', async () => {
		expect(await run({ clientId: 'conservaqua' })).toContain('The clientId must be an id');
		expect(await run({ clientId: leadId, organisationId: 'conservaqua' })).toContain('The organisationId must be an id');
		expect(doubles.getClient).not.toHaveBeenCalled();
	});
});
