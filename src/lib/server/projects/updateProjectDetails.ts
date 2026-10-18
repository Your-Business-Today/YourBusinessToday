import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProjectDatabase } from '$lib/data/projectDatabase';
import type { ProjectDetails } from '$lib/data/projectDetailsRules';

export type ProjectDetailsUpdate = ProjectDetails;

export async function updateProjectDetails(
	supabase: SupabaseClient,
	projectId: string,
	update: ProjectDetailsUpdate
): Promise<void> {
	const { error } = await supabase
		.from('projects')
		.update({
			name: update.name,
			description: update.description,
			status: update.status,
			repository_url: update.repositoryUrl,
			environment_url: update.environmentUrl,
			default_branch: update.defaultBranch,
			refactor_every_deploys: update.refactorEveryDeploys,
			...databaseColumns(update.database)
		})
		.eq('id', projectId);
	if (error) throw error;
}

function databaseColumns(database: ProjectDatabase) {
	return {
		database_kind: database.kind,
		database_server: database.server,
		database_name: database.name,
		database_user: database.user,
		migrations_path: database.migrationsPath
	};
}
