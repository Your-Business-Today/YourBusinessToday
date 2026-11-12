import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { companyResearchLimits } from '$lib/data/companyResearchRules';
import { getClient } from '$lib/server/clients/getClient';
import { groupClientsUnder, type GroupChoice } from '$lib/server/clients/groupClientsUnder';
import { hasCompanyNumber } from '$lib/server/clients/clientRecord';
import { importCompanyOfficers } from '$lib/server/clients/importCompanyOfficers';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { noSuchClient } from './describeClient';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const clientIdField = textField('The client id, as given by list_clients');
const chooseAGroup = 'Give parentClientId for a company already on the register, or newParentName for a new parent, not both.';
const nameTooLong = `The newParentName is at most ${companyResearchLimits.longestName} characters.`;
const noNumberYet = 'Record the company number first, with update_company_profile, so Companies House can be asked.';
const noSuchParent = 'No client on the register has that parentClientId. Call list_clients to see them.';

export const clientGroupActions: McpAction[] = [
	{
		name: 'group_client_under',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'put a client under a parent company, an existing one or a new one named here',
		guidance:
			'A group of companies is one parent with its companies under it. A company is never put under itself or ' +
			'under one of its own companies. The grouping is written into the client history under your name.',
		inputSchema: objectSchema(
			{ clientId: clientIdField, parentClientId: textField('The parent already on the register'), newParentName: textField('The name of a new parent to create') },
			['clientId']
		),
		run: async (caller, input) => groupUnder(caller, input)
	},
	{
		name: 'import_company_officers',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: "add a client's current officers from Companies House to the People register and list them at the company",
		inputSchema: objectSchema({ clientId: clientIdField }, ['clientId']),
		run: async (caller, input) => importOfficers(caller, readText(input, 'clientId'))
	}
];

async function groupUnder(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const clientId = readText(input, 'clientId');
	const idRefusal = validateRecordId('clientId', clientId);
	if (idRefusal !== null) return idRefusal;
	const choice = readGroupChoice(input);
	if (typeof choice === 'string') return choice;
	const client = await getClient(caller.supabase, clientId);
	if (client === null) return noSuchClient;
	const parentRefusal = await refuseUnknownParent(caller, choice);
	if (parentRefusal !== null) return parentRefusal;
	const parentId = await groupClientsUnder(caller.supabase, [client.id], choice, caller.accountId);
	const parent = await getClient(caller.supabase, parentId);
	return `${client.name} is grouped under ${parent?.name ?? 'the parent'} — client ${parentId}.`;
}

function readGroupChoice(input: Record<string, unknown>): GroupChoice | string {
	const existingParentId = readOptionalText(input, 'parentClientId');
	const newParentName = readOptionalText(input, 'newParentName');
	const isOneChoice = (existingParentId === null) !== (newParentName === null);
	if (!isOneChoice) return chooseAGroup;
	if (existingParentId !== null) return validateRecordId('parentClientId', existingParentId) ?? { existingParentId };
	if (newParentName === null || newParentName.length > companyResearchLimits.longestName) return nameTooLong;
	return { newParentName };
}

async function refuseUnknownParent(caller: McpCaller, choice: GroupChoice): Promise<string | null> {
	if (!('existingParentId' in choice)) return null;
	const parent = await getClient(caller.supabase, choice.existingParentId);
	return parent === null ? noSuchParent : null;
}

async function importOfficers(caller: McpCaller, clientId: string): Promise<string> {
	const idRefusal = validateRecordId('clientId', clientId);
	if (idRefusal !== null) return idRefusal;
	if (!isCompaniesHouseConfigured()) return companiesHouseNotConfigured;
	const client = await getClient(caller.supabase, clientId);
	if (client === null) return noSuchClient;
	if (!hasCompanyNumber(client)) return noNumberYet;
	const outcome = await importCompanyOfficers(caller.supabase, client, caller.accountId);
	return `${outcome.importedCount} officer(s) added at ${client.name}, ${outcome.alreadyListedCount} already listed.`;
}
