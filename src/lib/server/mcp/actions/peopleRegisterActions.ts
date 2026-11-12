import { addPerson } from '$lib/server/people/addPerson';
import { deletePerson } from '$lib/server/people/deletePerson';
import { describePeopleList } from './describePeople';
import { getCompaniesForPerson } from '$lib/server/people/getCompaniesForPerson';
import { getPeople } from '$lib/server/people/getPeople';
import { getPerson } from '$lib/server/people/getPerson';
import { newPersonFields, personIdField } from './personFieldSchema';
import { noSuchPerson } from './describePerson';
import { objectSchema, readText } from '../actionTypes';
import { validatePersonFields } from '$lib/data/validatePersonFields';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const peopleRegisterActions: McpAction[] = [
	{
		name: 'list_people',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: 'everyone on the People register — the directors and owners we are pursuing — with their standing and the stages of their companies',
		inputSchema: objectSchema({}),
		run: async (caller) => describePeopleList(await getPeople(caller.supabase))
	},
	{
		name: 'add_person',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'put a person on the People register as a lead in their own right',
		guidance:
			'A director or an owner is a lead in their own right; their companies come next, listed with ' +
			'add_client_contact at each. A person already on the register under that email is given back, ' +
			'not added twice. Someone found on Companies House is added from their officer record instead.',
		inputSchema: objectSchema(newPersonFields, ['name']),
		run: async (caller, input) => addToRegister(caller, input)
	},
	{
		name: 'delete_person',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'delete a person added to the People register by mistake',
		guidance:
			'Only for someone who should never have been on the register. It removes them with their links ' +
			'and notes and takes them off every company they sit on, and it cannot be undone. Someone we ' +
			'are no longer pursuing is marked cold with update_person instead.',
		inputSchema: objectSchema({ personId: personIdField }, ['personId']),
		run: async (caller, input) => deleteFromRegister(caller, readText(input, 'personId'))
	}
];

async function addToRegister(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const fields = validatePersonFields({ ...input, name: readText(input, 'name') });
	if (typeof fields === 'string') return fields;
	const seed = { name: fields.name ?? '', email: fields.email ?? '', phone: fields.phone ?? '', seniority: fields.seniority ?? '' };
	const added = await addPerson(caller.supabase, seed);
	if (added.wasAlreadyKnown) return `${seed.email} is already on the People register — person ${added.personId}.`;
	return `${seed.name} is on the People register as a lead — person ${added.personId}.`;
}

async function deleteFromRegister(caller: McpCaller, personId: string): Promise<string> {
	const idRefusal = validateRecordId('personId', personId);
	if (idRefusal !== null) return idRefusal;
	const person = await getPerson(caller.supabase, personId);
	if (person === null) return noSuchPerson;
	const companies = await getCompaniesForPerson(caller.supabase, person.id);
	await deletePerson(caller.supabase, person.id);
	return `${person.name} is deleted from the People register, with their links and notes, and taken off ${companiesCount(companies.length)}.`;
}

function companiesCount(count: number): string {
	if (count === 0) return 'no companies';
	if (count === 1) return 'one company';
	return `${count} companies`;
}
