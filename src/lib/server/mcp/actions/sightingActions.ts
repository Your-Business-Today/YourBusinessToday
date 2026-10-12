import { describeSightingList } from './describeSighting';
import { describeSightingOutcome, recordSighting } from '$lib/server/sightings/recordSighting';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { listSightingsForPatch } from '$lib/server/sightings/listSightings';
import { sightingSourceOrder } from '$lib/data/sightingRules';
import { validateSighting } from '$lib/server/sightings/validateSighting';
import { objectSchema, readText, textField } from '../actionTypes';
import { withPatch } from '$lib/server/patches/withPatch';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const patchIdField = textField('The patch id, as given by list_patches');

export const sightingActions: McpAction[] = [
	{
		name: 'record_sighting',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: 'record a business you found on a public page while working a sector, with the page it was seen on',
		guidance:
			'Read the sector first with read_sector, so a business already known is matched rather than recorded ' +
			'twice. Record only what a public page says, business-contact data only, never a page behind a login: ' +
			'LinkedIn, X, Facebook and Instagram are refused. The source URL is the page the business was read on.',
		inputSchema: objectSchema(
			{
				patchId: patchIdField,
				sector: textField('The sector it was found in, such as KT1 1'),
				businessName: textField('The business as it names itself'),
				address: textField('Its address, if the page gives one'),
				postcode: textField('Its postcode, if known — it must fall in the sector'),
				companyNumber: textField('Its Companies House number, only if the page gives it'),
				website: textField('Its own website, if it has one'),
				sourceUrl: textField('The public page it was read on'),
				sourceKind: textField(`What kind of page: ${sightingSourceOrder.join(', ')}`),
				whatWasSeen: textField('One or two lines on what the page showed about the business')
			},
			['patchId', 'sector', 'businessName', 'sourceUrl', 'sourceKind', 'whatWasSeen']
		),
		run: async (caller, input) => withPatch(caller, input, (patch) => record(caller, patch.id, input))
	},
	{
		name: 'list_sightings',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: 'every business sighted on the web in a patch, newest first, optionally one sector',
		inputSchema: objectSchema({ patchId: patchIdField, sector: textField('Narrow to one sector, such as KT1 1') }, ['patchId']),
		run: async (caller, input) => withPatch(caller, input, (patch) => list(caller, patch.outcodes, readText(input, 'sector').toUpperCase()))
	}
];

async function record(caller: McpCaller, patchId: string, input: Record<string, unknown>): Promise<string> {
	const seed = {
		sector: readText(input, 'sector').toUpperCase(),
		businessName: readText(input, 'businessName'),
		address: readText(input, 'address'),
		postcode: readText(input, 'postcode'),
		companyNumber: readText(input, 'companyNumber'),
		website: readText(input, 'website'),
		sourceUrl: readText(input, 'sourceUrl'),
		sourceKind: readText(input, 'sourceKind'),
		whatWasSeen: readText(input, 'whatWasSeen')
	};
	const refusal = validateSighting(seed);
	if (refusal !== null) return refusal;
	const outcome = await recordSighting(caller.supabase, seed, patchId, caller.accountId);
	return describeSightingOutcome(outcome, seed);
}

async function list(caller: McpCaller, outcodes: string[], sector: string): Promise<string> {
	const sightings = (await listSightingsForPatch(caller.supabase, outcodes)).filter((sighting) => sector === '' || sighting.sector === sector);
	const accounts = await getAccountsById(caller.supabase, sightings.map((sighting) => sighting.seenByAccountId));
	return describeSightingList(sightings, accounts);
}
