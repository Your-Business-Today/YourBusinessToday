import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { readContextLinks } from './readContextLinks';
import { readContextParts } from './readContextParts';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CompanyContextVersion } from '$lib/data/companyContext/companyContext';

/** The latest version of an organisation's company context, whole; none before its first run or migration 0154. */
export async function readLatestCompanyContext(
	supabase: SupabaseClient,
	organisationId: string
): Promise<CompanyContextVersion | null> {
	const { data, error } = await supabase
		.from('company_context_versions')
		.select('id, version_number, stage, recorded_at')
		.eq('organisation_id', organisationId)
		.order('version_number', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	if (data === null) return null;
	const versionId = String(data.id);
	const connectors = await readConnectors(supabase, versionId);
	const { parts, steps, keysById } = await readContextParts(supabase, versionId);
	const links = await readContextLinks(supabase, versionId, keysById);
	const versionNumber = Number(data.version_number);
	const recordedAt = String(data.recorded_at);
	return {
		versionNumber,
		recordedAt,
		stage: String(data.stage),
		connectors,
		parts,
		steps,
		links
	};
}

async function readConnectors(supabase: SupabaseClient, versionId: string): Promise<string[]> {
	const { data, error } = await supabase
		.from('company_context_connectors')
		.select('name')
		.eq('version_id', versionId)
		.order('name');
	if (error) throw error;
	return data.map((row) => String(row.name));
}
