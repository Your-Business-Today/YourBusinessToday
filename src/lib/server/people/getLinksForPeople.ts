import type { SupabaseClient } from '@supabase/supabase-js';

export type PersonLink = {
	id: string;
	personId: string;
	label: string;
	url: string;
};

export async function getLinksForPeople(supabase: SupabaseClient, personIds: string[]): Promise<PersonLink[]> {
	if (personIds.length === 0) return [];
	const { data, error } = await supabase
		.from('person_links')
		.select('id, person_id, label, url')
		.in('person_id', personIds)
		.order('created_at');
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => ({
		id: row.id as string,
		personId: row.person_id as string,
		label: row.label as string,
		url: row.url as string
	}));
}
