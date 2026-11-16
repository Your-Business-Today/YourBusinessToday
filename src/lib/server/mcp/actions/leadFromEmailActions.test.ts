import { beforeEach, describe, expect, it, vi } from 'vitest';
import { leadFromEmailActions } from './leadFromEmailActions';
import { clientId, enquiry, filedEmailId, personId, staff, standUpEmptyRegister } from '$lib/server/leadsFromEmail/leadEnquiry.fixture';

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

describe('adding a new lead from an email', () => {
	it('puts the company on the register, lists the sender as its main contact and files the email under it', async () => {
		const answer = String(await addLead({ ...enquiry, companyNumber: '1234567' }));
		expect(answer).toContain('Acme Ltd is on the register as a lead, brought in by James');
		expect(answer).toContain(filedEmailId);
		expect(answer).toContain('YBT/Acme Ltd');
		const numbered = { name: 'Acme Ltd', ownerId: 'staff-1', profile: expect.objectContaining({ companyNumber: '01234567' }) };
		expect(register.creatingClient).toHaveBeenCalledWith(staff.supabase, expect.objectContaining(numbered), 'staff-1');
		const mainContact = { name: 'Joanne Smith', email: 'joanne@acme.example', phone: '01234 567890', isPrimary: true };
		expect(register.addingContact).toHaveBeenCalledWith(staff.supabase, clientId, expect.objectContaining(mainContact), 'staff-1');
		const filed = { clientId, personId, direction: 'received', subject: 'Help with our bookings' };
		expect(register.filing).toHaveBeenCalledWith(staff.supabase, expect.objectContaining(filed), 'staff-1');
		const source = expect.objectContaining({ channel: 'Email' });
		expect(register.recordingEvent).toHaveBeenCalledWith(staff.supabase, clientId, 'enquiry_received', source, 'staff-1');
	});

	it('names a private individual as the lead after the person who wrote', async () => {
		const { companyName: _companyLeftOut, ...fromThemselves } = enquiry;
		await addLead({ ...fromThemselves, isPrivateIndividual: true });
		const named = expect.objectContaining({ name: 'Joanne Smith' });
		expect(register.creatingClient).toHaveBeenCalledWith(staff.supabase, named, 'staff-1');
		expect(register.findingByName).not.toHaveBeenCalled();
	});
});
