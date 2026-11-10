import { accountNameLookup } from '$lib/data/accountNames';
import { brandLibraryBucket } from '$lib/server/brandLibrary/brandLibraryStorage';
import { describeLibrary, describeLibraryItem, noSuchLibraryItem } from './describeLibraryItem';
import { findKeptLibraryItem, readKeptLibrary } from '$lib/server/brandLibrary/findLibraryItems';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { readText } from '../actionTypes';
import { signFetchLink } from '$lib/server/storage/signFetchLink';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

type Input = Record<string, unknown>;

/** The brand's photos and videos, latest added first, each with whether it may be posted. */
export async function listLibrary(caller: McpCaller, _input: Input, organisation: Organisation): Promise<string> {
	const library = await readKeptLibrary(caller.supabase, organisation.id);
	return describeLibrary(organisation, library);
}

/** One photo or video's details and a short-lived link to look at it; one still awaited is not read. */
export async function readLibraryItem(caller: McpCaller, input: Input, organisation: Organisation): Promise<string> {
	const itemId = readText(input, 'itemId');
	const idRefusal = validateRecordId('itemId', itemId);
	if (idRefusal !== null) return idRefusal;
	const item = await findKeptLibraryItem(caller.supabase, organisation.id, itemId);
	if (item === null) return noSuchLibraryItem;
	const addedBy = item.addedBy ?? '';
	const people = await getAccountsById(caller.supabase, [addedBy].filter((accountId) => accountId !== ''));
	const link = await signFetchLink(caller.supabase, brandLibraryBucket, item);
	return describeLibraryItem(item, accountNameLookup(people)(addedBy), link);
}
