import type { SupabaseClient } from '@supabase/supabase-js';
import { areaEventColumns, parseAreaEventRow } from './areaEventRecord';
import type { AreaEvent } from '$lib/data/areaEvent';

const mostEventsRead = 30;

/** What the feed holds about one company, newest first. */
export async function listEventsForCompany(supabase: SupabaseClient, companyNumber: string): Promise<AreaEvent[]> {
	if (companyNumber === '') return [];
	const { data, error } = await supabase
		.from('area_events')
		.select(areaEventColumns)
		.eq('company_number', companyNumber)
		.order('created_at', { ascending: false })
		.limit(mostEventsRead);
	if (error) throw error;
	return data.flatMap((row: Record<string, unknown>) => {
		const event = parseAreaEventRow(row);
		return event === null ? [] : [event];
	});
}
