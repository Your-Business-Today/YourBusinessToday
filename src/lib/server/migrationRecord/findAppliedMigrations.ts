import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { appliedMigrationColumns, fromAppliedMigrationRow, type AppliedMigration } from './appliedMigrationRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Every file on the record of applied migrations, by name; null until the record's migration has run. */
export async function findAppliedMigrations(supabase: SupabaseClient): Promise<AppliedMigration[] | null> {
	const { data, error } = await supabase
		.from('applied_migrations')
		.select(appliedMigrationColumns)
		.order('file_name', { ascending: true });
	if (isSchemaNotYetMigrated(error)) return null;
	if (error !== null) throw error;
	return data.map(fromAppliedMigrationRow);
}
