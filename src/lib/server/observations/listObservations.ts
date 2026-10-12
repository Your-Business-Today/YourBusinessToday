import type { SupabaseClient } from '@supabase/supabase-js';
import { observationColumns, parseObservationRecord, type Observation } from './observationRecord';

export async function listObservationsForPatch(supabase: SupabaseClient, patchId: string): Promise<Observation[]> {
	const { data, error } = await supabase
		.from('observations')
		.select(observationColumns)
		.eq('patch_id', patchId)
		.order('observed_at', { ascending: false });
	if (error) throw error;
	return data.map(parseObservationRecord);
}

/** What has been noticed about one company, from any patch, newest first. */
export async function listObservationsForCompany(supabase: SupabaseClient, companyNumber: string): Promise<Observation[]> {
	if (companyNumber === '') return [];
	const { data, error } = await supabase
		.from('observations')
		.select(observationColumns)
		.eq('company_number', companyNumber)
		.order('observed_at', { ascending: false });
	if (error) throw error;
	return data.map(parseObservationRecord);
}
