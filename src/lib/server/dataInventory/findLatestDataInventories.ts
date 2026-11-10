import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { dataInventoryColumns, fromDataInventoryRow, type DataInventory } from './dataInventoryRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

const readingsCompared = 2;

/** The latest data inventory and the one before it, newest first; none until a migration run has kept one. */
export async function findLatestDataInventories(supabase: SupabaseClient): Promise<DataInventory[]> {
	const { data, error } = await supabase
		.from('data_inventories')
		.select(dataInventoryColumns)
		.order('taken_at', { ascending: false })
		.order('moment', { ascending: true })
		.limit(readingsCompared);
	if (isSchemaNotYetMigrated(error)) return [];
	if (error !== null) throw error;
	return data.map(fromDataInventoryRow);
}
