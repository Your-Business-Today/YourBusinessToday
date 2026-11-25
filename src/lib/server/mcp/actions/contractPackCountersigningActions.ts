import { countersignPack } from '$lib/server/contractPacks/countersignDoor';
import { validateRecordId } from '$lib/data/isUuid';
import { noSuchOrganisation, reachableOrganisation } from '../organisationAccess';
import { describeContractPack } from './describeContractPack';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const countersigningGuidance =
	'A YBT director countersigns a client\'s contract pack once the client has signed every document in the client portal. ' +
	'Each document is then made into a dated, signed PDF of the version the client signed, showing who signed for each side ' +
	'and when, and kept on the client organisation\'s documents as the next version of that document; the pack moves to ' +
	'countersigned. Read the pack first (read_contract_pack) and countersign only on the director\'s yes, with their own ' +
	'name, position and the day they sign. A document that changed after the client signed it is refused: the client signs it again first.';

const fields = {
	organisationId: textField("The client organisation's id, as list_organisations gives it"),
	packId: textField('The pack id, as read_contract_pack gives it'),
	signerName: textField('The name of the YBT director countersigning, 1 to 120 characters'),
	signerPosition: textField('Their position at Your Business Today, such as Director, 1 to 120 characters'),
	signedOn: textField('The day they sign, such as 2026-11-25')
};

export const contractPackCountersigningActions: McpAction[] = [
	{
		name: 'countersign_contract_pack',
		area: 'clients',
		audience: 'admin',
		isWrite: true,
		summary: "countersign a client-signed contract pack for YBT: each document kept as a dated, signed PDF on the client's organisation",
		guidance: countersigningGuidance,
		inputSchema: objectSchema(fields, ['organisationId', 'packId', 'signerName', 'signerPosition', 'signedOn']),
		run: async (caller, input) => countersign(caller, input)
	}
];

async function countersign(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const organisationId = readText(input, 'organisationId');
	const refusal = validateRecordId('organisationId', organisationId);
	if (refusal !== null) return refusal;
	const organisation = await reachableOrganisation(caller, organisationId);
	if (organisation === null) return noSuchOrganisation;
	const director = { supabase: caller.supabase, accountId: caller.accountId, organisation };
	const pack = await countersignPack(director, input);
	if (typeof pack === 'string') return pack;
	return `Countersigned.\n${describeContractPack(organisation.name, pack)}`;
}
