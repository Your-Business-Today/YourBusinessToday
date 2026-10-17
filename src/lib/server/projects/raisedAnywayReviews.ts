import type { SupabaseClient } from '@supabase/supabase-js';
import { postedViaChannels } from '$lib/data/conversationTurn';
import { raiseAnywayFieldName, raiseAnywayFormValue } from '$lib/data/similarTasks';
import { askSimilarTaskRaisers, type RaisedAnyway } from './askSimilarTaskRaisers';
import { getReachableProjectIds } from './getReachableProjectIds';

/** When the form raised a task anyway, ask the raisers of the open tasks like it what becomes of theirs. */
export async function askRaisersWhenRaisedAnyway(
	supabase: SupabaseClient,
	accountId: string,
	formData: FormData,
	raised: RaisedAnyway
): Promise<void> {
	const isRaisedAnyway = formData.get(raiseAnywayFieldName) === raiseAnywayFormValue;
	if (!isRaisedAnyway) return;
	const projectIds = await getReachableProjectIds(supabase, accountId);
	const raiser = { accountId, postedVia: postedViaChannels.site };
	await askSimilarTaskRaisers(supabase, projectIds, raiser, raised);
}
