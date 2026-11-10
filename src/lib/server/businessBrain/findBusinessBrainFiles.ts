import type { SupabaseClient } from '@supabase/supabase-js';
import { parseBusinessBrainFile, type BusinessBrainFile } from './businessBrainFileRecord';

/** The organisation's file with that id, if its upload link was granted to this person. */
export async function findSentFile(
	supabase: SupabaseClient,
	place: { organisationId: string; accountId: string },
	fileId: string
): Promise<BusinessBrainFile | null> {
	const { data, error } = await supabase
		.from('business_brain_files')
		.select('*')
		.eq('id', fileId)
		.eq('organisation_id', place.organisationId)
		.eq('sent_by', place.accountId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseBusinessBrainFile(data);
}

/** Which of these ids are files of the organisation that have arrived; the rest cannot be named by a page. */
export async function findArrivedFileIds(
	supabase: SupabaseClient,
	organisationId: string,
	fileIds: string[]
): Promise<string[]> {
	if (fileIds.length === 0) return [];
	const { data, error } = await supabase
		.from('business_brain_files')
		.select('id')
		.eq('organisation_id', organisationId)
		.in('id', fileIds)
		.not('recorded_at', 'is', null);
	if (error) throw error;
	return data.map((row) => row.id as string);
}

/** The organisation's file with that id once it has arrived, whoever sent it; a file still awaited is not kept yet. */
export async function findKeptFile(supabase: SupabaseClient, organisationId: string, fileId: string): Promise<BusinessBrainFile | null> {
	const { data, error } = await supabase
		.from('business_brain_files')
		.select('*')
		.eq('id', fileId)
		.eq('organisation_id', organisationId)
		.not('recorded_at', 'is', null)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseBusinessBrainFile(data);
}
