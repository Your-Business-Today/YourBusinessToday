import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { contractPackTable } from './contractPackTables';
import { packColumns, type PackRow } from './contractPackRows';
import { parseContractPack } from './parseContractPack';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContractPack } from '$lib/data/contractPack';

/** The organisation's latest contract pack, or the one named; null when it has none or the tables are not there yet. */
export async function readContractPack(supabase: SupabaseClient, organisationId: string, packId: string | null = null): Promise<ContractPack | null> {
	const query = supabase.from(contractPackTable).select(packColumns).eq('organisation_id', organisationId);
	const chosen = packId === null ? query.order('prepared_at', { ascending: false }) : query.eq('id', packId);
	const { data, error } = await chosen.limit(1).maybeSingle();
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	if (data === null) return null;
	return parseContractPack(data as unknown as PackRow);
}
