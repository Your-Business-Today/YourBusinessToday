import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { describeOfficerSearch } from './describeOfficers';
import { ensurePersonForOfficer } from '$lib/server/people/ensurePersonForOfficer';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { objectSchema, readText, textField } from '../actionTypes';
import { searchOfficers } from '$lib/server/companiesHouse/searchOfficers';
import { validateOfficerIdentity } from '$lib/data/personRules';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const queryNeedsWords = 'Give the name to search Companies House for.';

export const officerActions: McpAction[] = [
	{
		name: 'search_officers',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: 'find a director or secretary on Companies House by name, to add them to the People register',
		inputSchema: objectSchema({ query: textField('The name, as they would appear on a company filing') }, ['query']),
		run: async (_caller, input) => findOfficers(readText(input, 'query'))
	},
	{
		name: 'add_officer_as_person',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'put an officer found on Companies House on the People register as a person, or give back the person already held for them',
		guidance:
			'Take the officer id and the name from search_officers. The person is given back if the register already ' +
			'holds that officer. Then read_person_appointments lists the companies they hold that are not on the ' +
			'register yet, and import_person_appointments adds the ones chosen as leads.',
		inputSchema: objectSchema(
			{ officerId: textField('The officer id, as search_officers gives it'), name: textField('Their name, as search_officers gives it') },
			['officerId', 'name']
		),
		run: async (caller, input) => addOfficer(caller, input)
	}
];

async function findOfficers(query: string): Promise<string> {
	if (query === '') return queryNeedsWords;
	if (!isCompaniesHouseConfigured()) return companiesHouseNotConfigured;
	return describeOfficerSearch(await searchOfficers(query));
}

async function addOfficer(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const officer = { officerId: readText(input, 'officerId'), name: readText(input, 'name') };
	const refusal = validateOfficerIdentity(officer);
	if (refusal !== null) return refusal;
	const personId = await ensurePersonForOfficer(caller.supabase, officer);
	return `${officer.name} is on the People register — person ${personId}. read_person_appointments lists the companies they hold that are not on the register yet.`;
}
