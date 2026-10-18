import { deploysBetweenRefactorsFrom, type ProjectDetailsClaim } from '$lib/data/projectDetailsRules';
import { projectDetailsEditOf, type ProjectDetailsEdit } from '$lib/data/validateProjectDetails';
import { readOptionalText, readText } from '../actionTypes';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectDatabase } from '$lib/data/projectDatabase';

/** The project as the edit leaves it: every field given replaces, every field left out keeps what is there. */
export function parseProjectDetailsEdit(input: Record<string, unknown>, project: Project): ProjectDetailsEdit {
	return projectDetailsEditOf({
		name: readOptionalText(input, 'name') ?? project.name,
		description: readOptionalText(input, 'description') ?? project.description,
		status: readOptionalText(input, 'status') ?? project.status,
		repositoryUrl: readOptionalText(input, 'repositoryUrl') ?? project.repositoryUrl,
		environmentUrl: readOptionalText(input, 'environmentUrl') ?? project.environmentUrl,
		defaultBranch: readOptionalText(input, 'defaultBranch') ?? project.defaultBranch,
		refactorEveryDeploys: readRefactorEveryDeploys(input, project),
		database: readDatabase(input, project)
	});
}

function readDatabase(input: Record<string, unknown>, project: Project): ProjectDetailsClaim['database'] {
	const { database } = project;
	return {
		kind: readOptionalText(input, 'databaseKind') ?? database.kind,
		server: readOptionalText(input, 'databaseServer') ?? database.server,
		name: readOptionalText(input, 'databaseName') ?? database.name,
		user: readDatabaseUser(input, database),
		migrationsPath: readOptionalText(input, 'migrationsPath') ?? database.migrationsPath
	};
}

/** Unlike the other details, the user can be cleared: blank says the server is Entra-only. */
function readDatabaseUser(input: Record<string, unknown>, database: ProjectDatabase): string {
	if (input.databaseUser === undefined || input.databaseUser === null) return database.user;
	return readText(input, 'databaseUser');
}

function readRefactorEveryDeploys(input: Record<string, unknown>, project: Project): number {
	if (input.refactorEveryDeploys === undefined || input.refactorEveryDeploys === null) {
		return project.refactorEveryDeploys;
	}
	return deploysBetweenRefactorsFrom(input.refactorEveryDeploys);
}
