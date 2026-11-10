import type { SupabaseClient } from '@supabase/supabase-js';
import { postedDateNotShown, type CompanyJobAdvertsFound } from '$lib/data/jobAdvertRules';

/** What saving did: the adverts newly kept, and the ones whose page was kept already and left as it was. */
export type JobAdvertsSaved = { newCount: number; alreadyKeptCount: number };

const onePerAdvertPage = 'client_id,url';

/** Keeps each checked advert on the client; a page already kept is left as it was. */
export async function saveJobAdverts(
	supabase: SupabaseClient,
	found: CompanyJobAdvertsFound,
	actorAccountId: string
): Promise<JobAdvertsSaved> {
	const { adverts } = found;
	const rows = adverts.map((advert) => ({
		client_id: found.clientId,
		title: advert.title,
		url: advert.url,
		posted_on: advert.postedOn === postedDateNotShown ? null : advert.postedOn,
		found_by_account_id: actorAccountId
	}));
	const upsert = supabase.from('client_job_adverts').upsert(rows, { onConflict: onePerAdvertPage, ignoreDuplicates: true });
	const { data, error } = await upsert.select('id');
	if (error) throw error;
	const newCount = (data ?? []).length;
	return { newCount, alreadyKeptCount: adverts.length - newCount };
}
