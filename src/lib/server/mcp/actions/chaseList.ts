import { chaseItemsOwedBy } from './chaseItems';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getOtherPeopleOnProjects } from '$lib/server/owed/peopleOnProjects';
import { getWhatPersonOwes } from '$lib/server/owed/whatPersonOwes';
import { reachableProjectIds } from '../projectAccess';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { AskKind } from '$lib/data/askKind';
import type { McpCaller } from '../resolveMcpCaller';
import type { OpenSubject } from '$lib/server/conversations/getOpenSubjects';

/** Why someone is chased: an ask waiting on them, work in their name, or a to-do they promised on a task. */
export type ChaseReason = 'answer' | 'work' | 'promise';

/** One thing someone owes on the viewer's projects; askedById is who asked for it, when that is known. */
export type ChaseItem = {
	personId: string;
	subject: OpenSubject;
	reason: ChaseReason;
	askKind: AskKind | null;
	askedById: string | null;
	question: string | null;
	since: string | null;
};

/** Everything other people owe on the viewer's projects, with the people named. */
export type ChaseList = { items: ChaseItem[]; people: Account[]; isOnlyAskedByViewer: boolean };

/**
 * Who to chase reads, for everyone else on the viewer's projects, the same calculation of what a
 * person owes that their own summary reads, so the two always agree. Narrowed to what the viewer
 * asked for, it keeps only the asks they posted and the tasks they asked for.
 */
export async function getChaseList(caller: McpCaller, isOnlyAskedByViewer: boolean): Promise<ChaseList> {
	const { supabase, accountId } = caller;
	const projectIds = reachableProjectIds(caller);
	const { people, accounts } = await getOtherPeopleOnProjects(supabase, projectIds, accountId);
	const owings = await Promise.all(people.map((person) => getWhatPersonOwes(supabase, person, projectIds)));
	const everyItem = owings.flatMap((owes) => chaseItemsOwedBy(owes, projectIds));
	const items = isOnlyAskedByViewer ? everyItem.filter((item) => item.askedById === accountId) : everyItem;
	const askers = await getAccountsById(supabase, items.flatMap((item) => item.askedById ?? []));
	return { items, people: [...accounts, ...askers], isOnlyAskedByViewer };
}
