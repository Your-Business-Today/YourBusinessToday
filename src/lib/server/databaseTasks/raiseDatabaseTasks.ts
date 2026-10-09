import type { SupabaseClient } from '@supabase/supabase-js';
import { migrationFilesIn } from '$lib/data/migrationFiles';
import { hasDatabase, migrationsFolderOf } from '$lib/data/projectDatabase';
import type { Project } from '$lib/server/projects/projectRecord';
import type { PushedDeploy } from '$lib/server/deploys/readPushEvent';

/**
 * Every migration file a deploy added becomes a database task for the admin to run, once: a file
 * already raised on the project, by an earlier push or a redelivery, changes nothing. Answers how many are new.
 */
export async function raiseDatabaseTasks(
	supabase: SupabaseClient,
	project: Project,
	deploy: PushedDeploy
): Promise<number> {
	if (!hasDatabase(project.database)) return 0;
	const migrations = migrationFilesIn(deploy.addedFiles, migrationsFolderOf(project.database));
	if (migrations.length === 0) return 0;
	const rows = migrations.map((filePath) => ({
		project_id: project.id,
		file_path: filePath,
		commit_sha: deploy.commitSha,
		branch: deploy.branch
	}));
	const { data, error } = await supabase
		.from('database_tasks')
		.upsert(rows, { onConflict: 'project_id,file_path', ignoreDuplicates: true })
		.select('id');
	if (error) throw error;
	return data.length;
}
