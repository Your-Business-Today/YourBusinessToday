import { getPatch } from '$lib/server/patches/getPatch';
import { noSuchPatch } from './describePatch';
import { readText } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Patch } from '$lib/server/patches/patchRecord';

/** Every patch action starts by finding the patch; one that is not there is answered the same way everywhere. */
export async function withPatch(
	caller: McpCaller,
	input: Record<string, unknown>,
	work: (patch: Patch) => Promise<string>
): Promise<string> {
	const patch = await getPatch(caller.supabase, readText(input, 'patchId'));
	if (patch === null) return noSuchPatch;
	return work(patch);
}
