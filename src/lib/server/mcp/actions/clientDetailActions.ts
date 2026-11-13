import { broughtInByName } from '$lib/data/broughtInByName';
import { getStaffDirectory } from '$lib/server/projects/getStaffDirectory';
import { describeClientEvents, describeClientInFull, noSuchClient } from './describeClient';
import { getClient } from '$lib/server/clients/getClient';
import { getContactsForClient } from '$lib/server/clients/getContactsForClient';
import { getEventsForClient } from '$lib/server/clients/getEventsForClient';
import { getProjectsForClient } from '$lib/server/clients/getProjectsForClient';
import { getConversationsForClient } from '$lib/server/leadConversations/getConversationsForClient';
import { readClientResearchGuidance } from './companyResearchGuidance';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const clientIdField = textField('The client id, as given by list_clients');

export const clientDetailActions: McpAction[] = [
	{
		name: 'read_client',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: 'one client in full, with their company profile, their contacts, every conversation logged with them and the projects we run for them',
		guidance: readClientResearchGuidance,
		inputSchema: objectSchema({ clientId: clientIdField }, ['clientId']),
		run: async (caller, input) => readClientInFull(caller, readText(input, 'clientId'))
	},
	{
		name: 'read_client_history',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: 'the event ledger for one client, newest first',
		inputSchema: objectSchema({ clientId: clientIdField }, ['clientId']),
		run: async (caller, input) => readHistoryForClient(caller, readText(input, 'clientId'))
	}
];

async function readClientInFull(caller: McpCaller, clientId: string): Promise<string> {
	const client = await getClient(caller.supabase, clientId);
	if (client === null) return noSuchClient;
	const [contacts, projects, conversations, staffMembers] = await Promise.all([
		getContactsForClient(caller.supabase, client.id),
		getProjectsForClient(caller.supabase, client.id),
		getConversationsForClient(caller.supabase, client.id),
		getStaffDirectory(caller.supabase)
	]);
	const broughtInBy = broughtInByName(staffMembers, client.ownerId);
	return describeClientInFull({ client, broughtInBy }, contacts, projects, conversations);
}

async function readHistoryForClient(caller: McpCaller, clientId: string): Promise<string> {
	const client = await getClient(caller.supabase, clientId);
	if (client === null) return noSuchClient;
	const events = await getEventsForClient(caller.supabase, client.id);
	return `${client.name}\n${describeClientEvents(events)}`;
}
