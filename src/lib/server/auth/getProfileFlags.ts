import type { SupabaseClient } from '@supabase/supabase-js';

export type ProfileFlags = { isAdmin: boolean; isStaff: boolean; isRestricted: boolean };

const flagsReadByClient = new WeakMap<SupabaseClient, Promise<ProfileFlags>>();

/** The signed-in person's flags, read once per client: each request has its own client, so the layout and the page share one read. */
export function getProfileFlags(supabase: SupabaseClient): Promise<ProfileFlags> {
	const flagsRead = flagsReadByClient.get(supabase) ?? readProfileFlags(supabase);
	flagsReadByClient.set(supabase, flagsRead);
	return flagsRead;
}

async function readProfileFlags(supabase: SupabaseClient): Promise<ProfileFlags> {
	const { data, error } = await supabase
		.from('profiles')
		.select('is_admin, is_staff, is_restricted')
		.maybeSingle();
	if (error) throw error;
	return {
		isAdmin: data?.is_admin ?? false,
		isStaff: data?.is_staff ?? false,
		isRestricted: data?.is_restricted ?? false
	};
}
