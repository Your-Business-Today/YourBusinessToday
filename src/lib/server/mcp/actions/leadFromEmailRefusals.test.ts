import { beforeEach, describe, expect, it, vi } from 'vitest';
import { leadFromEmailActions } from './leadFromEmailActions';
import { clientId, enquiry, personId, staff, standUpEmptyRegister } from '$lib/server/leadsFromEmail/leadEnquiry.fixture';
import { leadFromEmailRefusals } from '$lib/server/leadsFromEmail/validateLeadFromEmail';
import { notOneStaffMember } from './salesLeaderboardActions';

const register = vi.hoisted(() => ({
	findingOwners: vi.fn(),
	findingByNumber: vi.fn(),
	findingByName: vi.fn(),
	resolvingStaff: vi.fn(),
	creatingClient: vi.fn(),
	addingContact: vi.fn(),
	findingPerson: vi.fn(),
	filing: vi.fn(),
	recordingEvent: vi.fn(),
	gettingClient: vi.fn()
}));
vi.mock('$lib/server/filedEmails/findRecordsForEmail', () => ({ findRecordsForEmail: register.findingOwners }));
vi.mock('$lib/server/clients/findClientByNumber', () => ({
	findClientByCompanyNumber: register.findingByNumber,
	findNumberlessClientByName: register.findingByName
}));
vi.mock('$lib/server/projects/resolveStaffMember', () => ({ resolveStaffMember: register.resolvingStaff }));
vi.mock('$lib/server/clients/createClient', () => ({ createClient: register.creatingClient }));
vi.mock('$lib/server/clients/addClientContact', () => ({ addClientContact: register.addingContact }));
vi.mock('$lib/server/people/findPerson', () => ({ findPersonByEmail: register.findingPerson }));
vi.mock('$lib/server/filedEmails/fileEmail', () => ({ fileEmail: register.filing }));
vi.mock('$lib/server/clients/recordClientEvent', () => ({ recordClientEvent: register.recordingEvent }));
vi.mock('$lib/server/clients/getClient', () => ({ getClient: register.gettingClient }));

const [addLeadFromEmailAction] = leadFromEmailActions;
const addLead = (input: Record<string, unknown>) => addLeadFromEmailAction.run(staff, input);
const writes = [register.creatingClient, register.addingContact, register.filing, register.recordingEvent];
const expectNothingWritten = () => writes.forEach((write) => expect(write).not.toHaveBeenCalled());

beforeEach(() => {
	vi.clearAllMocks();
	standUpEmptyRegister(register);
});

describe('refusing a lead that is already held, before anything is written', () => {
	it('answers with the person when the sender is already on the register', async () => {
		const acme = { id: clientId, name: 'Acme Ltd', stage: 'lead' };
		register.findingOwners.mockResolvedValue([{ address: enquiry.from, kind: 'person', personId, personName: 'Joanne Smith', companies: [acme] }]);
		const answer = String(await addLead(enquiry));
		expect(answer).toContain('Nothing was added');
		expect(answer).toContain(personId);
		expect(answer).toContain('file_email_to_client');
		expectNothingWritten();
	});

	it('answers with the company when its number is already on the register', async () => {
		register.findingByNumber.mockResolvedValue(clientId);
		const answer = String(await addLead({ ...enquiry, companyNumber: '01234567' }));
		expect(answer).toContain(`Acme Ltd is already on the register — client ${clientId}`);
		expectNothingWritten();
	});

	it('answers with the company when a lead of that name is already on the register', async () => {
		register.findingByName.mockResolvedValue(clientId);
		expect(String(await addLead(enquiry))).toContain('Nothing was added');
		expectNothingWritten();
	});
});

describe('refusing a value that does not fit, before anything is written', () => {
	it.each([
		[{ ...enquiry, senderName: '' }, leadFromEmailRefusals.senderNameRequired],
		[{ ...enquiry, isPrivateIndividual: true }, leadFromEmailRefusals.companyOrPrivate],
		[{ ...enquiry, companyName: '' }, leadFromEmailRefusals.companyOrPrivate],
		[{ ...enquiry, isPrivateIndividual: 'yes' }, leadFromEmailRefusals.privateIndividualNotYesOrNo],
		[{ ...enquiry, from: 'james@yourbusiness.today' }, leadFromEmailRefusals.fromUs]
	])('refuses %o', async (input, refusal) => {
		expect(await addLead(input)).toBe(refusal);
		expectNothingWritten();
	});

	it('refuses a company number that is not one', async () => {
		expect(String(await addLead({ ...enquiry, companyNumber: '12-34' }))).toContain('is not a company number');
		expectNothingWritten();
	});

	it('refuses a broughtInBy that names nobody on the staff', async () => {
		register.resolvingStaff.mockResolvedValue(null);
		expect(await addLead({ ...enquiry, broughtInBy: 'Nobody' })).toBe(notOneStaffMember);
		expectNothingWritten();
	});
});
