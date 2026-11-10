import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { readContextLinks } from './readContextLinks';
import { readContextParts } from './readContextParts';
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { CompanyContextVersion } from '$lib/data/companyContext/companyContext';

/** The columns of a kept version that say which it is: everything else hangs off its id. */
export const versionColumns = 'id, version_number, stage, recorded_at';

type VersionRow = Record<string, unknown>;
type VersionReading = { data: VersionRow | null; error: PostgrestError | null };

/** A version found by a query on its columns, read whole; none when there is no such version or no migration 0154. */
export async function readVersionContents(
	supabase: SupabaseClient,
	{ data, error }: VersionReading
): Promise<CompanyContextVersion | null> {
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	if (data === null) return null;
	const versionId = String(data.id);
	const connectors = await readConnectors(supabase, versionId);
	const { parts, steps, keysById } = await readContextParts(supabase, versionId);
	const links = await readContextLinks(supabase, versionId, keysById);
	return {
		versionNumber: Number(data.version_number),
		recordedAt: String(data.recorded_at),
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
