import { fail } from '@sveltejs/kit';
import { getOfficerAppointments } from '$lib/server/companiesHouse/getOfficerAppointments';
import { getPerson } from '$lib/server/people/getPerson';
import { companyNumberOf } from '$lib/server/clients/clientRecord';
import { groupClientsUnder, readGroupChoice } from '$lib/server/clients/groupClientsUnder';
import { importAppointmentsAsLeads, readChosenAppointments } from '$lib/server/people/importAppointmentsAsLeads';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { Actions } from './$types';
import type { OfficerAppointment } from '$lib/server/companiesHouse/officerAppointmentRecord';
import type { Person } from '$lib/server/people/personRecord';
import type { PersonCompany } from '$lib/server/people/getCompaniesForPerson';

const notOnCompaniesHouse = 'This person was not found through Companies House, so there is nothing to import.';

/** The register being unreachable costs the import panel, never the page. */
export async function pendingAppointmentsFor(
	person: Person,
	companies: PersonCompany[]
): Promise<OfficerAppointment[] | null> {
	if (person.officerId === null || !isCompaniesHouseConfigured()) return null;
	const listedNumbers = new Set(companies.map(companyNumberOf));
	try {
		const { appointments } = await getOfficerAppointments(person.officerId);
		return appointments.filter((appointment) => !listedNumbers.has(appointment.companyNumber));
	} catch (failure) {
		console.error('Officer appointments could not be read', failure);
		return null;
	}
}

export const importActions: Actions = {
	importAppointments: async ({ locals, params, request }) => {
		const user = await requireStaff(locals);
		const formData = await request.formData();
		const person = await getPerson(locals.supabase, params.personId);
		if (person === null) return fail(404, { message: 'That person could not be found.' });
		if (person.officerId === null) return fail(400, { message: notOnCompaniesHouse });
		const appointments = readChosenAppointments(formData);
		if (appointments.length === 0) return fail(400, { message: 'Tick at least one company.' });
		const groupName = String(formData.get('groupName') ?? '').trim();
		const imported = await importAppointmentsAsLeads(locals.supabase, person, appointments, groupName, user.id);
		const { clientIds } = imported;
		return { message: describeImport(clientIds.length, groupName) };
	},
	groupUnder: async ({ locals, request }) => {
		const user = await requireStaff(locals);
		const formData = await request.formData();
		const clientId = String(formData.get('clientId') ?? '');
		const choice = readGroupChoice(formData);
		if (clientId === '') return fail(400, { message: 'A company is required.' });
		if (choice === null) return fail(400, { message: 'Choose a group or name a new one.' });
		await groupClientsUnder(locals.supabase, [clientId], choice, user.id);
		return { message: 'Grouped.' };
	}
};

function describeImport(companyCount: number, groupName: string): string {
	const companies = `${companyCount} compan${companyCount === 1 ? 'y' : 'ies'} added as leads`;
	if (groupName === '') return `${companies}.`;
	return `${companies} under ${groupName}.`;
}
