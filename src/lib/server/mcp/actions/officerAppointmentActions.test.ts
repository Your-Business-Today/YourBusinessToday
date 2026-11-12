import { beforeEach, describe, expect, it, vi } from 'vitest';
import { everyAppointmentListed } from './describeOfficers';
import { noSuchPerson } from './describePerson';
import { officerAppointmentActions } from './officerAppointmentActions';
import type { McpCaller } from '../resolveMcpCaller';

const samId = '11111111-1111-4111-8111-111111111111';
const unknownId = '22222222-2222-4222-8222-222222222222';
const samsOfficerId = 'abc123officer';
const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;
const riversLtd = { companyNumber: '01234567', companyName: 'Rivers Ltd', officerRole: 'director', appointedOn: '2020-03-01', address: '1 Quay St, Manchester' };
const riversHoldings = { companyNumber: '07654321', companyName: 'Rivers Holdings Ltd', officerRole: 'secretary', appointedOn: '', address: '' };
const alreadyListed = { companyNumber: '11111111', companyName: 'Listed Already Ltd', officerRole: 'director', appointedOn: '', address: '' };

const { companiesHouse, appointmentsImported } = vi.hoisted(() => ({
	companiesHouse: { isConfigured: true, appointments: [] as Record<string, string>[] },
	appointmentsImported: vi.fn()
}));

const sam = { id: samId, name: 'Sam Rivers', officerId: samsOfficerId as string | null, links: [], notes: [] };
const listedCompany = { id: 'client-listed', name: 'Listed Already Ltd', companyNumber: '11111111' };

vi.mock('$lib/server/companiesHouse/companiesHouseRequest', () => ({ isCompaniesHouseConfigured: () => companiesHouse.isConfigured }));
vi.mock('$lib/server/companiesHouse/getOfficerAppointments', () => ({
	getOfficerAppointments: async () => ({ officerName: 'Sam Rivers', appointments: companiesHouse.appointments })
}));
vi.mock('$lib/server/people/getPerson', () => ({
	getPerson: async (_supabase: unknown, personId: string) => (personId === samId ? sam : null)
}));
vi.mock('$lib/server/people/getCompaniesForPerson', () => ({ getCompaniesForPerson: async () => [listedCompany] }));
vi.mock('$lib/server/clients/clientRecord', () => ({ companyNumberOf: (client: { companyNumber: string }) => client.companyNumber }));
vi.mock('$lib/server/people/importAppointmentsAsLeads', () => ({ importAppointmentsAsLeads: appointmentsImported }));

function run(name: string, input: Record<string, unknown>) {
	const action = officerAppointmentActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(staff, input);
}

describe("a person's appointments through the connector", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		companiesHouse.isConfigured = true;
		companiesHouse.appointments = [riversLtd, riversHoldings, alreadyListed];
		sam.officerId = samsOfficerId;
	});

	it('lists the current appointments the register lacks, by company number', async () => {
		expect(await run('read_person_appointments', { personId: samId })).toBe(
			[
				'Rivers Ltd — director — since 1 Mar 2020 — company number 01234567 — 1 Quay St, Manchester',
				'Rivers Holdings Ltd — secretary — company number 07654321'
			].join('\n')
		);
		expect(await run('read_person_appointments', { personId: unknownId })).toBe(noSuchPerson);
	});

	it('says when every appointment is already on the register, and when the person was not found through Companies House', async () => {
		companiesHouse.appointments = [alreadyListed];
		expect(await run('read_person_appointments', { personId: samId })).toBe(everyAppointmentListed);
		sam.officerId = null;
		expect(await run('read_person_appointments', { personId: samId })).toContain('not found through Companies House');
	});

	it('imports the chosen appointments as leads under the group named', async () => {
		appointmentsImported.mockResolvedValue({ clientIds: ['client-1', 'client-2'], groupId: 'group-1' });
		const answer = await run('import_person_appointments', { personId: samId, companyNumbers: ['1234567', '07654321'], groupName: 'Rivers group' });
		expect(answer).toBe('2 companies added as leads under Rivers group.');
		expect(appointmentsImported).toHaveBeenCalledWith(staff.supabase, sam, [riversLtd, riversHoldings], 'Rivers group', 'staff-1');
	});

	it('refuses a number that is not a pending appointment of theirs, importing nothing', async () => {
		expect(await run('import_person_appointments', { personId: samId, companyNumbers: ['11111111'] })).toContain('11111111 is not a current appointment');
		expect(await run('import_person_appointments', { personId: samId, companyNumbers: [] })).toContain('at least one company number');
		expect(appointmentsImported).not.toHaveBeenCalled();
	});
});
