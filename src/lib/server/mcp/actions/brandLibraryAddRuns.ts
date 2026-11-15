import { checkLibraryItem } from '$lib/brand/library/checkLibraryItem';
import { describeLibraryRecording, describeLibraryUpload } from './describeLibraryUpload';
import { findBrandSummary } from '$lib/server/brandKits/keepBrandSummary';
import { grantLibraryUpload } from '$lib/server/brandLibrary/grantLibraryUpload';
import { noBrandYet } from './brandKitWriteAnswers';
import { readText } from '../actionTypes';
import { recordLibraryUpload } from '$lib/server/brandLibrary/recordLibraryUpload';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

type Input = Record<string, unknown>;

/** Keeps a photo or video as described, waiting for its file, under the person asking, and gives the link to send it to. */
export async function addLibraryItem(caller: McpCaller, input: Input, organisation: Organisation): Promise<string> {
	const item = checkLibraryItem(input);
	if (typeof item === 'string') return `Not added: ${item}. Nothing was kept.`;
	const summary = await findBrandSummary(caller.supabase, organisation.id);
	if (summary === null) return noBrandYet(organisation);
	const adder = { organisationId: organisation.id, accountId: caller.accountId };
	const grant = await grantLibraryUpload(caller.supabase, adder, item);
	return describeLibraryUpload(organisation, item, grant);
}

/** Records that the file sent to a granted link arrived, so the item shows in the library. */
export async function recordLibraryItem(caller: McpCaller, input: Input, organisation: Organisation): Promise<string> {
	const itemId = readText(input, 'itemId');
	const idRefusal = validateRecordId('itemId', itemId);
	if (idRefusal !== null) return idRefusal;
	const adder = { organisationId: organisation.id, accountId: caller.accountId };
	const recording = await recordLibraryUpload(caller.supabase, adder, itemId);
	return describeLibraryRecording(organisation, itemId, recording);
}
