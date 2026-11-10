import type { SupabaseClient } from '@supabase/supabase-js';

export type AdminUserSummary = {
	email: string;
	credits: number;
	isAdmin: boolean;
	isStaff: boolean;
	isRestricted: boolean;
	joinedAt: string;
};

export async function getAdminUserList(supabase: SupabaseClient): Promise<AdminUserSummary[]> {
	const { data, error } = await supabase.rpc('admin_list_users');
	if (error) throw error;
	const staffEmails = await getStaffEmails(supabase);
	return data.map((row: Record<string, unknown>) => ({
		email: row.email as string,
		credits: row.credits as number,
		isAdmin: row.is_admin as boolean,
		isStaff: staffEmails.has(row.email as string),
		isRestricted: row.is_restricted as boolean,
		joinedAt: row.joined_at as string
	}));
}

async function getStaffEmails(supabase: SupabaseClient): Promise<Set<string>> {
	const { data, error } = await supabase.rpc('admin_list_staff_flags');
	if (error) throw error;
	const staffRows = data.filter((row: Record<string, unknown>) => row.is_staff === true);
	return new Set(staffRows.map((row: Record<string, unknown>) => row.email as string));
}
