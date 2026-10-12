import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { daysAgo } from '$lib/data/days';
import { geocodeRegisterPostcodes } from '$lib/server/register/geocodeRegisterPostcodes';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { objectSchema, readText, textField } from '../actionTypes';
import { validateFeedSince } from '$lib/data/areaFeedChoices';
import { watchOutcode } from '$lib/server/register/watchOutcode';
import { withPatch } from '$lib/server/patches/withPatch';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Patch } from '$lib/server/patches/patchRecord';

const oneDay = 1;

export const registerActions: McpAction[] = [
	{
		name: 'geocode_register_postcodes',
		area: 'patches',
		audience: 'admin',
		isWrite: true,
		summary: 'geocode one page of register postcodes the patches have not located yet, and say how many remain',
		guidance: 'Call it again until it answers that nothing remains; each call looks up one page through postcodes.io.',
		inputSchema: objectSchema({}),
		run: async (caller) => {
			const progress = await geocodeRegisterPostcodes(caller.supabase);
			if (progress.remainingCount === 0) return `${progress.geocodedCount} geocoded; every register postcode in the patches is now located.`;
			return `${progress.geocodedCount} geocoded; ${progress.remainingCount} register postcodes still to geocode — call again.`;
		}
	},
	{
		name: 'run_patch_watch',
		area: 'patches',
		audience: 'admin',
		isWrite: true,
		summary: 'ask Companies House now for the companies incorporated, dissolved or in trouble in one patch since a day, as the nightly watch does',
		inputSchema: objectSchema({ patchId: textField('The patch id'), since: textField('The day to check from, as YYYY-MM-DD; yesterday when left out') }, ['patchId']),
		run: async (caller, input) => withPatch(caller, input, (patch) => watchNow(caller, patch, readText(input, 'since')))
	}
];

async function watchNow(caller: McpCaller, patch: Patch, since: string): Promise<string> {
	if (!isCompaniesHouseConfigured()) return companiesHouseNotConfigured;
	const refusal = validateFeedSince(since === '' ? null : since);
	if (refusal !== null) return refusal;
	const day = since === '' ? daysAgo(oneDay) : since;
	const { outcodes, sicCodes } = patch;
	let written = 0;
	for (const outcode of outcodes) written += await watchOutcode(caller.supabase, outcode, sicCodes, day);
	return `${written} companies seen across ${outcodes.length} outcodes since ${day}; the feed carries the incorporations and dissolutions.`;
}
