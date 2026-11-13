import type { SupabaseClient } from '@supabase/supabase-js';
import { nameSpeltByEmail } from '$lib/data/nameSpeltByEmail';

export type StaffMember = { id: string; name: string; email: string };

const noDisplayName = '';

export async function getStaffDirectory(supabase: SupabaseClient): Promise<StaffMember[]> {
	const { data, error } = await supabase.rpc('staff_directory');
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => ({
		id: row.id as string,
		name: nameToShow(row),
		email: row.email as string
	}));
}

function nameToShow(row: Record<string, unknown>): string {
	const displayName = ((row.display_name ?? noDisplayName) as string).trim();
	if (displayName !== noDisplayName) return displayName;
	return nameSpeltByEmail(row.email as string);
}
