import { getPatch } from './getPatch';
import { noSuchPatch } from '$lib/server/mcp/actions/describePatch';
import { readText } from '$lib/server/mcp/actionTypes';
import type { McpCaller } from '$lib/server/mcp/resolveMcpCaller';
import type { Patch } from './patchRecord';

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
