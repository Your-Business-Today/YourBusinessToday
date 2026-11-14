import { companiesHouseNotConfigured } from '$lib/server/register/watchRegister';
import { daysAgo } from '$lib/data/days';
import { geocodeRegisterPostcodes } from '$lib/server/register/geocodeRegisterPostcodes';
import { isCompaniesHouseConfigured } from '$lib/server/companiesHouse/companiesHouseRequest';
import { objectSchema, readText, textField } from '../actionTypes';
import { patchCompaniesSource } from '$lib/server/watch/patchCompaniesSource';
import { runWatchSource } from '$lib/server/watch/runWatchSource';
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
	},
	{
		name: 'pull_patch_companies',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: "pull every active company registered in a patch's outcodes from Companies House onto the register, carrying on from the last call",
		guidance:
			'Call it again until it answers that every outcode is pulled; each call carries on at the outcode after the last one finished. Then geocode_register_postcodes until nothing remains, and read_patch_companies lists them.',
		inputSchema: objectSchema({ patchId: textField('The patch id, as given by list_patches') }, ['patchId']),
		run: async (caller, input) => withPatch(caller, input, (patch) => pullNow(caller, patch))
	}
];

async function pullNow(caller: McpCaller, patch: Patch): Promise<string> {
	if (!isCompaniesHouseConfigured()) return companiesHouseNotConfigured;
	const report = await runWatchSource(caller.supabase, patchCompaniesSource(patch));
	const nextStep = report.isFinished ? 'Next: geocode_register_postcodes until nothing remains.' : 'Call again to carry on.';
	return `${report.rowsWritten} companies written for ${patch.name}. ${report.note} ${nextStep}`;
}

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
