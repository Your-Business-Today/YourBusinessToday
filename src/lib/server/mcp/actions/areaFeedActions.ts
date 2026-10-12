import { areaEventSentence, areaFeedScopes, parseAreaFeedScope } from '$lib/data/areaEvent';
import { formatBritishDateTime } from '$lib/data/britishDate';
import { getFeedForPatches } from '$lib/server/areaEvents/getFeedForPatches';
import { listPatches } from '$lib/server/patches/listPatches';
import { parseAreaEventKind, areaEventKindOrder } from '$lib/data/areaEventKindOrder';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { validateFeedSince } from '$lib/data/areaFeedChoices';
import type { AreaEvent } from '$lib/data/areaEvent';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Patch } from '$lib/server/patches/patchRecord';

export const areaFeedActions: McpAction[] = [
	{
		name: 'read_patch_feed',
		area: 'patches',
		audience: 'staff',
		isWrite: false,
		summary: 'what changed on the ground of your patches, newest first: sectors searched, businesses sighted, leads added, and by whom',
		guidance:
			'The same rows the site shows at /clients/feed. Read it on a Monday to tell your person what ' +
			'changed since they last looked; narrow by patch, by kind, or by a date to start from.',
		inputSchema: objectSchema({
			patchId: textField('One patch to read — leave out for the patches you work, or every patch when you work none'),
			scope: textField('"everything" for every patch; leave out for your own'),
			kind: textField(`One kind of event: ${areaEventKindOrder.join(', ')}`),
			since: textField('Only events from this date, as YYYY-MM-DD')
		}),
		run: async (caller, input) => readFeed(caller, input)
	}
];

async function readFeed(caller: McpCaller, input: Record<string, unknown>): Promise<string> {
	const since = readOptionalText(input, 'since');
	const refusal = validateFeedSince(since);
	if (refusal !== null) return refusal;
	const patches = patchesInView(await listPatches(caller.supabase), caller, input);
	const events = await getFeedForPatches(caller.supabase, {
		outcodes: patches.flatMap((patch) => patch.outcodes),
		kind: parseAreaEventKind(readOptionalText(input, 'kind')),
		since
	});
	if (events.length === 0) return 'Nothing has happened on this ground yet.';
	return events.map(feedLine).join('\n');
}

function patchesInView(patches: Patch[], caller: McpCaller, input: Record<string, unknown>): Patch[] {
	const patchId = readText(input, 'patchId');
	if (patchId !== '') return patches.filter((patch) => patch.id === patchId);
	const scope = parseAreaFeedScope(readOptionalText(input, 'scope') ?? areaFeedScopes.mine);
	const own = patches.filter((patch) => patch.ownerAccountId === caller.accountId);
	if (scope === areaFeedScopes.mine && own.length > 0) return own;
	return patches;
}

function feedLine(event: AreaEvent): string {
	const source = event.sourceUrl === '' ? '' : ` (${event.sourceUrl})`;
	return `${formatBritishDateTime(event.createdAt)}: ${areaEventSentence(event)}${source} — event id ${event.id}`;
}
