import { describeContinuityCopy } from './describeContinuityCopy';
import { getClient } from '$lib/server/clients/getClient';
import { noSuchClient } from './describeClient';
import { objectSchema, readText, textField } from '../actionTypes';
import { recordContinuityCopy } from '$lib/server/clients/recordContinuityCopy';
import { ukClockAt } from '$lib/data/ukClock';
import { validateContinuityCopy } from '$lib/data/continuityCopy';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const dayField = (what: string) => textField(`The day ${what}, as YYYY-MM-DD; leave out while it has not happened`);

export const clientContinuityCopyActions: McpAction[] = [
	{
		name: 'record_client_continuity_copy',
		area: 'clients',
		audience: 'staff',
		isWrite: true,
		summary: "record when a client's continuity storage was connected and when they confirmed opening a copy",
		guidance:
			'Schedule 4 section 5.2: each month the client portal writes a copy of the system to storage the client owns. ' +
			'Record the connection once the portal shows its first copy written, and the opened copy only on the ' +
			"client's own word, naming who confirmed it. Every field is written as given, so send all three each time.",
		inputSchema: objectSchema(
			{
				clientId: textField('The client id, as given by list_clients'),
				storageConnectedOn: dayField("the client's storage was connected"),
				copyOpenedOn: dayField('the client confirmed they opened a copy'),
				copyConfirmedBy: textField('Who at the client confirmed it, with the opened day')
			},
			['clientId']
		),
		run: async (caller, input) => recordForClient(caller, input)
	}
];

async function recordForClient(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const clientId = readText(input, 'clientId');
	const idRefusal = validateRecordId('clientId', clientId);
	if (idRefusal !== null) return idRefusal;
	const continuityCopy = validateContinuityCopy(input, ukClockAt(new Date()).date);
	if (typeof continuityCopy === 'string') return continuityCopy;
	const client = await getClient(caller.supabase, clientId);
	if (client === null) return noSuchClient;
	await recordContinuityCopy(caller.supabase, client.id, continuityCopy);
	return `${client.name} — ${describeContinuityCopy(continuityCopy)}.`;
}
