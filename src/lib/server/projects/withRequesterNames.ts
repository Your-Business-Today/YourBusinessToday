import type { SupabaseClient } from '@supabase/supabase-js';
import { accountNameLookup } from '$lib/data/accountNames';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { isRequest } from '$lib/data/queueBand';
import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';

/** Each task asked for by someone other than its project's owner, with that person's name on it. */
export async function withRequesterNames(
	supabase: SupabaseClient,
	tasks: GlobalTask[]
): Promise<GlobalTask[]> {
	const requests = tasks.filter(isRequest);
	const requesterIds = requests.map((task) => task.requestedBy);
	const nameOf = accountNameLookup(await getAccountsById(supabase, requesterIds));
	return tasks.map((task) => {
		if (!isRequest(task)) return task;
		return { ...task, requesterName: nameOf(task.requestedBy) };
	});
}
