import type { SupabaseClient } from '@supabase/supabase-js';
import { defaultBranchWhenUnset, parseRefactorEveryDeploys } from './projectRecord';
import { parseDatabaseKind } from '$lib/data/databaseKind';
import { parseProjectStatus, type ProjectStatus } from '$lib/data/projectStatus';
import type { ProjectDatabase } from '$lib/data/projectDatabase';

export type ProjectDetailsUpdate = {
	name: string;
	description: string;
	status: ProjectStatus;
	repositoryUrl: string;
	environmentUrl: string;
	defaultBranch: string;
	refactorEveryDeploys: number;
	database: ProjectDatabase;
};

/** The edit form as one update; null when it names no project. */
export function parseProjectDetailsForm(formData: FormData): ProjectDetailsUpdate | null {
	const name = text(formData, 'name');
	if (name === '') return null;
	return {
		name,
		description: text(formData, 'description'),
		status: parseProjectStatus(formData.get('status')),
		repositoryUrl: text(formData, 'repositoryUrl'),
		environmentUrl: text(formData, 'environmentUrl'),
		defaultBranch: text(formData, 'defaultBranch') || defaultBranchWhenUnset,
		refactorEveryDeploys: parseRefactorEveryDeploys(text(formData, 'refactorEveryDeploys')),
		database: readDatabaseForm(formData)
	};
}

function readDatabaseForm(formData: FormData): ProjectDatabase {
	return {
		kind: parseDatabaseKind(text(formData, 'databaseKind')),
		server: text(formData, 'databaseServer'),
		name: text(formData, 'databaseName'),
		user: text(formData, 'databaseUser'),
		migrationsPath: text(formData, 'migrationsPath')
	};
}

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

function text(formData: FormData, field: string): string {
	return String(formData.get(field) ?? '').trim();
}
