import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { jobAdvertColumns, jobAdvertFromRow, rolesWeServeFirst } from './jobAdvert';
import type { JobAdvert } from '$lib/data/jobAdvertRules';

/** The adverts kept on a client, latest found first, with the roles we replace or amplify ahead of the rest. */
export async function getJobAdvertsForClient(supabase: SupabaseClient, clientId: string): Promise<JobAdvert[]> {
	const query = supabase.from('client_job_adverts').select(jobAdvertColumns).eq('client_id', clientId);
	const { data, error } = await query.order('found_at', { ascending: false });
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	const adverts = (data ?? []).map((row) => jobAdvertFromRow(row as Record<string, unknown>));
	return adverts.sort(rolesWeServeFirst);
}
