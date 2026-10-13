import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { readProjectBlueprint, type BlueprintReading } from './readProjectBlueprint';
import type { Project } from '$lib/server/projects/projectRecord';

export const blueprintNotYetMigrated = 'not_yet_migrated';

/**
 * A deploy re-reads the project's domain and site map at the commit it landed. Until the blueprint's migration
 * has run there is nowhere to keep it, and the deploy is still recorded.
 */
export async function readBlueprintOnDeploy(
	supabase: SupabaseClient,
	project: Project,
	ref: string
): Promise<BlueprintReading['kind'] | typeof blueprintNotYetMigrated> {
	try {
		return (await readProjectBlueprint(supabase, project, ref)).kind;
	} catch (failure) {
		if (isSchemaNotYetMigrated(failure)) return blueprintNotYetMigrated;
		throw failure;
	}
}
