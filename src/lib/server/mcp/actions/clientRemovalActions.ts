import { deleteClientRecord } from '$lib/server/clients/deleteClientRecord';
import { getClient } from '$lib/server/clients/getClient';
import { noSuchClient } from './describeClient';
import { objectSchema, readText, textField } from '../actionTypes';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const clientRemovalActions: McpAction[] = [
	{
		name: 'delete_client',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: 'delete a duplicate or mistaken record from the clients register',
		guidance:
			'Only for a record that should never have been on the register. A client with projects, ' +
			'invoices, companies grouped under it or a continuity copy is refused: move it to dormant or ' +
			'lost with move_client_stage instead. The deletion is recorded under your name with a copy of ' +
			'everything it removes, and the record leaves the register at once.',
		inputSchema: objectSchema({ clientId: textField('The client id, as given by list_clients') }, ['clientId']),
		run: async (caller, input) => deleteFromRegister(caller, input)
	}
];

async function deleteFromRegister(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const clientId = readText(input, 'clientId');
	const idRefusal = validateRecordId('clientId', clientId);
	if (idRefusal !== null) return idRefusal;
	const client = await getClient(caller.supabase, clientId);
	if (client === null) return noSuchClient;
	const refusal = await deleteClientRecord(caller.supabase, client, caller.accountId);
	if (refusal !== null) return refusal;
	return `${client.name} is deleted from the register, and the deletion is recorded under your name.`;
}
