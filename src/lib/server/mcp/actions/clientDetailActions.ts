import { describeClientEvents, describeClientInFull, noSuchClient } from './describeClient';
import { getClient } from '$lib/server/clients/getClient';
import { getContactsForClient } from '$lib/server/clients/getContactsForClient';
import { getEventsForClient } from '$lib/server/clients/getEventsForClient';
import { getProjectsForClient } from '$lib/server/clients/getProjectsForClient';
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
		summary: 'one client in full, with their contacts and the projects we run for them',
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
	return describeClientInFull(
		client,
		await getContactsForClient(caller.supabase, client.id),
		await getProjectsForClient(caller.supabase, client.id)
	);
}

async function readHistoryForClient(caller: McpCaller, clientId: string): Promise<string> {
	const client = await getClient(caller.supabase, clientId);
	if (client === null) return noSuchClient;
	const events = await getEventsForClient(caller.supabase, client.id);
	return `${client.name}\n${describeClientEvents(events)}`;
}
