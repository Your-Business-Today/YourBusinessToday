import { clientStageLabels, clientStageOrder } from '$lib/data/clientLifecycle';
import { createClient } from '$lib/server/clients/createClient';
import { describeClientList, noSuchClient } from './describeClient';
import { getClient } from '$lib/server/clients/getClient';
import { listClients } from '$lib/server/clients/listClients';
import { moveClientStage } from '$lib/server/clients/moveClientStage';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const stageField = textField(`The stage to move to: ${clientStageOrder.join(', ')}`);

export const clientRegisterActions: McpAction[] = [
	{
		name: 'list_clients',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: 'every client on the register, with their stage, named contact and open requests',
		inputSchema: objectSchema({}),
		run: async (caller) => describeClientList(await listClients(caller.supabase))
	},
	{
		name: 'create_client',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'put a new company on the register as a lead',
		inputSchema: objectSchema(
			{ name: textField('The company name'), website: textField('Their website, if you have it') },
			['name']
		),
		run: async (caller, input) => addClientToRegister(caller, input)
	},
	{
		name: 'move_client_stage',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'move a client to another stage of the lifecycle',
		guidance:
			'The register is only worth reading if it tells the truth, so move a client the day the ' +
			'relationship changes, including to dormant or lost. Every move is written into that ' +
			'client history under your name.',
		inputSchema: objectSchema(
			{ clientId: textField('The client id, as given by list_clients'), stage: stageField },
			['clientId', 'stage']
		),
		run: async (caller, input) => moveToStage(caller, input)
	}
];

async function addClientToRegister(
	caller: McpCaller,
	input: Record<string, unknown>
): Promise<string> {
	const name = readText(input, 'name');
	if (name === '') return 'A company needs a name before it can go on the register.';
	const seed = { name, website: readText(input, 'website'), ownerId: caller.accountId };
	const clientId = await createClient(caller.supabase, seed, caller.accountId);
	return `${name} is on the register as a lead — id ${clientId}.`;
}

async function moveToStage(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const requestedStage = readText(input, 'stage');
	const stage = clientStageOrder.find((candidate) => candidate === requestedStage);
	if (stage === undefined) return `There is no ${requestedStage} stage. Use one of: ${clientStageOrder.join(', ')}.`;
	const client = await getClient(caller.supabase, readText(input, 'clientId'));
	if (client === null) return noSuchClient;
	await moveClientStage(caller.supabase, client.id, stage, caller.accountId);
	return `${client.name} is now at ${clientStageLabels[stage]}.`;
}
