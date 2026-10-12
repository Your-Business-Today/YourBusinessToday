import { claimSector, releaseClaim } from '$lib/server/sectors/claimSector';
import { describeClaimOutcome, describeHandOverOutcome } from '$lib/server/sectors/sectorOutcomeSentences';
import { handSectorTo } from '$lib/server/sectors/handSectorTo';
import { objectSchema, readText, textField } from '../actionTypes';
import { withPatch } from './withPatch';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const patchIdField = textField('The patch id, as given by list_patches');
const sectorField = textField('The sector, such as KT1 1');

export const claimActions: McpAction[] = [
	{
		name: 'claim_sector',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: 'claim a sector of a patch before you search it, so nobody else works the same ground',
		inputSchema: objectSchema({ patchId: patchIdField, sector: sectorField }, ['patchId', 'sector']),
		run: async (caller, input) => claim(caller, input)
	},
	{
		name: 'release_sector',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: 'give up a claim on a sector without marking it searched',
		inputSchema: objectSchema({ patchId: patchIdField, sector: sectorField }, ['patchId', 'sector']),
		run: async (caller, input) => release(caller, input)
	},
	{
		name: 'hand_sector_to',
		area: 'patches',
		audience: 'staff',
		isWrite: true,
		summary: 'hand a sector to a named colleague, by their email address',
		inputSchema: objectSchema(
			{ patchId: patchIdField, sector: sectorField, email: textField("The colleague's email address") },
			['patchId', 'sector', 'email']
		),
		run: async (caller, input) => handOver(caller, input)
	}
];

function claim(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const sector = readText(input, 'sector').toUpperCase();
	return withPatch(caller, input, async (patch) => {
		const outcome = await claimSector(caller.supabase, patch, sector, caller.accountId);
		return describeClaimOutcome(caller.supabase, outcome, sector);
	});
}

function release(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const sector = readText(input, 'sector').toUpperCase();
	return withPatch(caller, input, async (patch) => {
		await releaseClaim(caller.supabase, patch.id, sector);
		return `${sector} is released.`;
	});
}

function handOver(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const sector = readText(input, 'sector').toUpperCase();
	return withPatch(caller, input, async (patch) => {
		const outcome = await handSectorTo(caller.supabase, patch, sector, readText(input, 'email'));
		return describeHandOverOutcome(outcome, sector);
	});
}
