import { getCompaniesForPerson } from '$lib/server/people/getCompaniesForPerson';
import { getPerson } from '$lib/server/people/getPerson';
import { noSuchPerson } from './describePerson';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { personFields, personIdField } from './personFieldSchema';
import { personProfileSaves, updatePersonProfile, type PersonProfileEdit } from '$lib/server/people/updatePersonProfile';
import { updateContactRole } from '$lib/server/clients/updateContactRole';
import { validatePersonFields } from '$lib/data/validatePersonFields';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { PersonInFull } from '$lib/server/people/getPerson';

const emailTaken = 'That email address already belongs to someone else on the People register.';
const noSuchContact = 'No company lists this person under that contact id. read_client gives each contact id beside the person.';
const nothingToChange = 'Nothing was given to change: send the fields that change, and only those.';
const ownFields = ['personId', 'contactId', 'role'];

export const personUpdateActions: McpAction[] = [
	{
		name: 'update_person',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: "change a person's details and standing on the People register — only the fields you give change",
		guidance:
			'Send the fields that change and leave the rest out; what is not sent is kept. The role is what ' +
			'they do at one company, so it goes with the contact id of their listing there (read_client ' +
			'gives it), never on the person. Mark someone cold rather than deleting them.',
		inputSchema: objectSchema(
			{
				personId: personIdField,
				...personFields,
				contactId: textField('The contact id of their listing at one company, when the role changes'),
				role: textField('What they do at that company, in their own words')
			},
			['personId']
		),
		run: async (caller, input) => changePerson(caller, input)
	}
];

async function changePerson(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const personId = readText(input, 'personId');
	const idRefusal = validateRecordId('personId', personId);
	if (idRefusal !== null) return idRefusal;
	const changes = validatePersonFields(fieldsOfThePerson(input));
	if (typeof changes === 'string') return changes;
	const contactId = readOptionalText(input, 'contactId');
	const hasNothingToChange = Object.keys(changes).length === 0 && contactId === null;
	if (hasNothingToChange) return nothingToChange;
	const person = await getPerson(caller.supabase, personId);
	if (person === null) return noSuchPerson;
	const edit: PersonProfileEdit = { ...profileOf(person), ...changes };
	const outcome = await updatePersonProfile(caller.supabase, person.id, edit);
	if (outcome === personProfileSaves.emailTaken) return emailTaken;
	const roleRefusal = await changeRole(caller, person.id, contactId, readText(input, 'role'));
	if (roleRefusal !== null) return roleRefusal;
	return `${edit.name} saved.`;
}

function fieldsOfThePerson(input: Record<string, unknown>): Record<string, unknown> {
	return Object.fromEntries(Object.entries(input).filter(([field]) => !ownFields.includes(field)));
}

function profileOf(person: PersonInFull): PersonProfileEdit {
	return {
		name: person.name,
		email: person.email,
		phone: person.phone,
		seniority: person.seniority,
		isDecisionMaker: person.isDecisionMaker,
		warmth: person.warmth,
		lastContactedOn: person.lastContactedOn,
		nextAction: person.nextAction,
		nextActionDue: person.nextActionDue
	};
}

/** The role is saved on the person's listing at that company, once the listing is shown to be theirs. */
async function changeRole(caller: McpCaller, personId: string, contactId: string | null, role: string): Promise<string | null> {
	if (contactId === null) return null;
	const idRefusal = validateRecordId('contactId', contactId);
	if (idRefusal !== null) return idRefusal;
	const companies = await getCompaniesForPerson(caller.supabase, personId);
	const isTheirListing = companies.some((company) => company.contactId === contactId);
	if (!isTheirListing) return noSuchContact;
	await updateContactRole(caller.supabase, contactId, role);
	return null;
}
