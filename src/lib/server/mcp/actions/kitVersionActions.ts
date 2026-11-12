import { describeKitVersionRegister } from './describeKitVersions';
import { describeKitVersionsRead, readOwnedKitVersions } from '$lib/server/kit/readOwnedKitVersions';
import { getKitVersionRegister } from '$lib/server/kit/getKitVersionRegister';
import { getLatestKitVersion } from '$lib/server/kit/kitVersions';
import { objectSchema } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const kitVersionActions: McpAction[] = [
	{
		name: 'read_kit_versions',
		area: 'projects',
		audience: 'everyone',
		isWrite: false,
		summary: 'which project-process kit version each repository of yours is on, behind first, as the Kit versions page lists them',
		inputSchema: objectSchema({}),
		run: async (caller) => listKitVersions(caller)
	},
	{
		name: 'refresh_kit_versions',
		area: 'projects',
		audience: 'everyone',
		isWrite: true,
		summary: 'read the kit version from project-process and from every repository of yours now, then list them',
		guidance:
			"Every push to a repository's default branch reads its version again, and a push to project-process reads " +
			'the latest; this reads them without waiting for a push.',
		inputSchema: objectSchema({}),
		run: async (caller) => refreshKitVersions(caller)
	}
];

async function listKitVersions(caller: McpCaller): Promise<string> {
	const latestKitVersion = await getLatestKitVersion(caller.supabase);
	const register = await getKitVersionRegister(caller.supabase, caller.accountId, latestKitVersion);
	return describeKitVersionRegister(register);
}

async function refreshKitVersions(caller: McpCaller): Promise<string> {
	const read = await readOwnedKitVersions(caller.supabase, caller.accountId);
	return `${describeKitVersionsRead(read)}\n${await listKitVersions(caller)}`;
}
