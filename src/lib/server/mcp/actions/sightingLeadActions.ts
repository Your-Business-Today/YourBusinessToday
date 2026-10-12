import { addSightingAsLead } from '$lib/server/sightings/addSightingAsLead';
import { getSighting } from '$lib/server/sightings/listSightings';
import { matchOutcomes, matchSightingToRegister } from '$lib/server/sightings/matchSightingToRegister';
import { noSuchSighting } from './describeSighting';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const sightingIdField = textField('The sighting id, as given by list_sightings');

export const sightingLeadActions: McpAction[] = [
	{
		name: 'add_sighting_as_lead',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: 'put a sighted business on the clients register as a lead, with the page it was seen on kept as its source',
		inputSchema: objectSchema({ sightingId: sightingIdField }, ['sightingId']),
		run: async (caller, input) => promote(caller, input)
	},
	{
		name: 'match_sighting_to_register',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: 'stamp a sighting with the company number it is on the register as, once you have confirmed it',
		guidance: 'Only a number the register holds is accepted; read_patch_companies finds it by name.',
		inputSchema: objectSchema(
			{ sightingId: sightingIdField, companyNumber: textField('The company number, as read_patch_companies gives it') },
			['sightingId', 'companyNumber']
		),
		run: async (caller, input) => match(caller, input)
	}
];

async function promote(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const sighting = await getSighting(caller.supabase, readText(input, 'sightingId'));
	if (sighting === null) return noSuchSighting;
	const outcome = await addSightingAsLead(caller.supabase, sighting, caller.accountId);
	if (outcome.wasAlreadyListed) return `${sighting.businessName} is already on the register — client id ${outcome.clientId}.`;
	return `${sighting.businessName} is on the register as a lead — client id ${outcome.clientId}.`;
}

async function match(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const sighting = await getSighting(caller.supabase, readText(input, 'sightingId'));
	if (sighting === null) return noSuchSighting;
	const companyNumber = readText(input, 'companyNumber').toUpperCase();
	const outcome = await matchSightingToRegister(caller.supabase, sighting.id, companyNumber);
	if (outcome.kind === matchOutcomes.notOnRegister) return `${companyNumber} is not on the register in any patch.`;
	return `${sighting.businessName} is matched to ${outcome.registeredName} (${companyNumber}).`;
}
