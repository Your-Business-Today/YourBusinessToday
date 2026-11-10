import type { SupabaseClient } from '@supabase/supabase-js';

/** Which kept version is an organisation's latest: its id, to write beside it, and its number, as the client saw it. */
export type LatestVersion = { id: string; versionNumber: number };

/** The latest version an organisation's Claude recorded; none before its first run. */
export async function findLatestVersion(service: SupabaseClient, organisationId: string): Promise<LatestVersion | null> {
	const { data, error } = await service
		.from('company_context_versions')
		.select('id, version_number')
		.eq('organisation_id', organisationId)
		.order('version_number', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return { id: String(data.id), versionNumber: Number(data.version_number) };
}

/** Said when the map the client acted on is older than the version their Claude has recorded since. */
export function newerVersionRecorded(versionNumber: number): { refusal: string } {
	return { refusal: `Version ${versionNumber} has been recorded since you opened the map: reload it and look again there.` };
}
