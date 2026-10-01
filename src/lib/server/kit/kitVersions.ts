import type { SupabaseClient } from '@supabase/supabase-js';

export async function getLatestKitVersion(supabase: SupabaseClient): Promise<string> {
	const { data, error } = await supabase.from('project_process_kit').select('latest_version').maybeSingle();
	if (error) throw error;
	return (data?.latest_version as string | undefined) ?? '';
}

export async function recordLatestKitVersion(supabase: SupabaseClient, version: string): Promise<void> {
	const { error } = await supabase
		.from('project_process_kit')
		.upsert({ id: true, latest_version: version, read_at: new Date().toISOString() });
	if (error) throw error;
}

export async function recordProjectKitVersion(
	supabase: SupabaseClient,
	projectId: string,
	version: string
): Promise<void> {
	const { error } = await supabase
		.from('projects')
		.update({ kit_version: version, kit_version_read_at: new Date().toISOString() })
		.eq('id', projectId);
	if (error) throw error;
}
