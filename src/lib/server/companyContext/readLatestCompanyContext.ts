import { readVersionContents, versionColumns } from './readVersionContents';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CompanyContextVersion } from '$lib/data/companyContext/companyContext';

const firstVersionNumber = 1;

/** The latest version of an organisation's company context, whole; none before its first run or migration 0154. */
export async function readLatestCompanyContext(
	supabase: SupabaseClient,
	organisationId: string
): Promise<CompanyContextVersion | null> {
	const reading = await supabase
		.from('company_context_versions')
		.select(versionColumns)
		.eq('organisation_id', organisationId)
		.order('version_number', { ascending: false })
		.limit(1)
		.maybeSingle();
	return readVersionContents(supabase, reading);
}

/** The version kept just before this one, whole, so what changed between them can be told; none before version 2. */
export async function readVersionBefore(
	supabase: SupabaseClient,
	organisationId: string,
	context: CompanyContextVersion
): Promise<CompanyContextVersion | null> {
	if (context.versionNumber <= firstVersionNumber) return null;
	const reading = await supabase
		.from('company_context_versions')
		.select(versionColumns)
		.eq('organisation_id', organisationId)
		.eq('version_number', context.versionNumber - 1)
		.maybeSingle();
	return readVersionContents(supabase, reading);
}
