import { getClient } from '$lib/server/clients/getClient';
import { loadSalesLeaderboard } from '$lib/server/salesLeaderboard/loadSalesLeaderboard';
import { resolveSalesperson } from '$lib/server/salesPeople/resolveSalesperson';
import { salesNotSwitchedOn, salesOrganisationWithId } from './salesOrganisation';
import { setClientOwner } from '$lib/server/clients/setClientOwner';
import { validateRecordId } from '$lib/data/isUuid';
import { describeSalesStandings } from './describeSalesStandings';
import { noSuchClient } from './describeClient';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const broughtInByField = textField(
	"Who brought it in: the name of someone on the organisation whose register it is, such as Nigel. Leave it out when it was you"
);
export const notOneStaffMember = 'broughtInBy names nobody on the organisation whose register it is, or more than one of them. Give their whole name.';

export const salesLeaderboardActions: McpAction[] = [
	{
		name: 'set_client_brought_in_by',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'name the staff member who brought a lead or client in, which the Sales leaderboard counts',
		guidance:
			'The person who brought a record in is the one whose introduction or work found it, whoever typed it in. ' +
			'The change is written on its history under your name.',
		inputSchema: objectSchema(
			{ clientId: textField('The client id, as list_clients gives it'), broughtInBy: broughtInByField },
			['clientId']
		),
		run: async (caller, input) => setBroughtInBy(caller, input)
	},
	{
		name: 'read_leaderboard',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: "each of an organisation's own people's leads and won sales on its registers, the most won first",
		inputSchema: objectSchema(
			{ organisationId: textField('The organisation whose registers to count, as list_organisations gives it') },
			['organisationId']
		),
		run: async (caller, input) => readLeaderboard(caller, readText(input, 'organisationId'))
	}
];

async function setBroughtInBy(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const clientId = readText(input, 'clientId');
	const idRefusal = validateRecordId('clientId', clientId);
	if (idRefusal !== null) return idRefusal;
	const client = await getClient(caller.supabase, clientId);
	if (client === null) return noSuchClient;
	const organisation = await salesOrganisationWithId(caller, client.keptByOrganisationId);
	if (organisation === null) return salesNotSwitchedOn;
	const owner = await resolveSalesperson(caller.supabase, organisation.id, readText(input, 'broughtInBy'), caller.accountId);
	if (owner === null) return notOneStaffMember;
	await setClientOwner(caller.supabase, client.id, owner, caller.accountId);
	return `${client.name} was brought in by ${owner.name}.`;
}

async function readLeaderboard(caller: McpCaller, organisationId: string): Promise<string> {
	const refusal = validateRecordId('organisationId', organisationId);
	if (refusal !== null) return refusal;
	const organisation = await salesOrganisationWithId(caller, organisationId);
	if (organisation === null) return salesNotSwitchedOn;
	return describeSalesStandings(await loadSalesLeaderboard(caller.supabase, organisation.id));
}
