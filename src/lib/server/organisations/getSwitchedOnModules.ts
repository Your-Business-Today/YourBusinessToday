import type { SupabaseClient } from '@supabase/supabase-js';
import { isOrganisationModule, type OrganisationModule } from '$lib/data/organisationModules';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';

/** The modules switched on for one organisation; none until migration 0145 has run. */
export async function getSwitchedOnModules(
	supabase: SupabaseClient,
	organisationId: string
): Promise<OrganisationModule[]> {
	const { data, error } = await supabase
		.from('organisation_modules')
		.select('module')
		.eq('organisation_id', organisationId)
		.eq('is_on', true);
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	const modules = data.map((row) => String(row.module));
	return modules.filter(isOrganisationModule);
}
