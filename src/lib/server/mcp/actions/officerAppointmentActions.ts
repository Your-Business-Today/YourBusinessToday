import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { companyNumberOf } from '$lib/server/clients/clientRecord';
import { companyResearchLimits } from '$lib/data/companyResearchRules';
import { describePendingAppointments } from './describeOfficers';
import { getCompaniesForPerson } from '$lib/server/people/getCompaniesForPerson';
import { getOfficerAppointments } from '$lib/server/companiesHouse/getOfficerAppointments';
import { getPerson } from '$lib/server/people/getPerson';
import { importAppointmentsAsLeads } from '$lib/server/people/importAppointmentsAsLeads';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { noSuchPerson } from './describePerson';
import { objectSchema, readText, textField } from '../actionTypes';
import { personIdField } from './personFieldSchema';
import { validateAppointmentChoice } from '$lib/data/appointmentImportRules';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { OfficerAppointment } from '$lib/server/companiesHouse/officerAppointmentRecord';
import type { PersonInFull } from '$lib/server/people/getPerson';

const notOnCompaniesHouse = 'This person was not found through Companies House, so there are no appointments to read.';
const notTheirAppointment = (companyNumber: string) =>
	`${companyNumber} is not a current appointment of theirs that the register lacks: read_person_appointments lists those.`;

export const officerAppointmentActions: McpAction[] = [
	{
		name: 'read_person_appointments',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: 'the companies a person holds a current appointment at, live from Companies House, that are not on the clients register yet',
		inputSchema: objectSchema({ personId: personIdField }, ['personId']),
		run: async (caller, input) => readPending(caller, readText(input, 'personId'))
	},
	{
		name: 'import_person_appointments',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: "add the chosen companies from a person's current appointments to the clients register as leads, grouped under a parent if named",
		guidance:
			'Choose from what read_person_appointments listed, by company number. Each company goes on the register as a ' +
			'lead with the person listed at it in their officer role; a group name puts them all under a new parent company ' +
			`with the person as its owner (the People page suggests "<surname> group"). The name is at most ${companyResearchLimits.longestName} characters.`,
		inputSchema: objectSchema(
			{
				personId: personIdField,
				companyNumbers: { type: 'array', items: { type: 'string' }, description: 'The company numbers to add, as read_person_appointments gives them' },
				groupName: textField('The parent company to group them under, or leave it out for none')
			},
			['personId', 'companyNumbers']
		),
		run: async (caller, input) => importChosen(caller, input)
	}
];

async function readPending(caller: McpCaller, personId: string): Promise<string> {
	const idRefusal = validateRecordId('personId', personId);
	if (idRefusal !== null) return idRefusal;
	const person = await getPerson(caller.supabase, personId);
	if (person === null) return noSuchPerson;
	const pending = await pendingAppointmentsOf(caller, person);
	if (typeof pending === 'string') return pending;
	return describePendingAppointments(pending);
}

async function importChosen(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const personId = readText(input, 'personId');
	const idRefusal = validateRecordId('personId', personId);
	if (idRefusal !== null) return idRefusal;
	const choice = validateAppointmentChoice(input);
	if (typeof choice === 'string') return choice;
	const person = await getPerson(caller.supabase, personId);
	if (person === null) return noSuchPerson;
	const pending = await pendingAppointmentsOf(caller, person);
	if (typeof pending === 'string') return pending;
	const chosen = pending.filter((appointment) => choice.companyNumbers.includes(appointment.companyNumber));
	const missing = choice.companyNumbers.find((number) => !chosen.some((appointment) => appointment.companyNumber === number));
	if (missing !== undefined) return notTheirAppointment(missing);
	const { clientIds } = await importAppointmentsAsLeads(caller.supabase, person, chosen, choice.groupName, caller.accountId);
	return describeImport(clientIds.length, choice.groupName);
}

/** What Companies House holds against the person today, less the companies the register already has. */
async function pendingAppointmentsOf(caller: McpCaller, person: PersonInFull): Promise<OfficerAppointment[] | string> {
	if (person.officerId === null) return notOnCompaniesHouse;
	if (!isCompaniesHouseConfigured()) return companiesHouseNotConfigured;
	const companies = await getCompaniesForPerson(caller.supabase, person.id);
	const listedNumbers = new Set(companies.map(companyNumberOf));
	const { appointments } = await getOfficerAppointments(person.officerId);
	return appointments.filter((appointment) => !listedNumbers.has(appointment.companyNumber));
}

function describeImport(companyCount: number, groupName: string): string {
	const companies = companyCount === 1 ? 'one company added as a lead' : `${companyCount} companies added as leads`;
	if (groupName === '') return `${companies}.`;
	return `${companies} under ${groupName}.`;
}
