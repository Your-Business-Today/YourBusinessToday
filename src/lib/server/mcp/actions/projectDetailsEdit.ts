import { parseRefactorEveryDeploys } from '$lib/server/projects/projectRecord';
import { databaseKindOrder, isDatabaseKind } from '$lib/data/databaseKind';
import { projectStatusOrder } from '$lib/data/projectStatus';
import { readOptionalText, readText } from '../actionTypes';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectDetailsUpdate } from '$lib/server/projects/updateProjectDetails';
import { projectDatabaseRefusal, type ProjectDatabase } from '$lib/data/projectDatabase';
import type { ProjectStatus } from '$lib/data/projectStatus';

export const wrongStatus = `A project is ${projectStatusOrder.join(', ')}. Pick one of those.`;
export const wrongDatabaseKind = `A database is ${databaseKindOrder.join(', ')}. Pick one of those.`;

export type ProjectDetailsEdit = { update: ProjectDetailsUpdate } | { refusal: string };

/** The project as the edit leaves it: every field given replaces, every field left out keeps what is there. */
export function parseProjectDetailsEdit(input: Record<string, unknown>, project: Project): ProjectDetailsEdit {
	const status = readStatus(input, project);
	if (status === null) return { refusal: wrongStatus };
	const database = readDatabase(input, project);
	if (database === null) return { refusal: wrongDatabaseKind };
	const databaseRefusal = projectDatabaseRefusal(database);
	if (databaseRefusal !== null) return { refusal: databaseRefusal };
	return {
		update: {
			name: readOptionalText(input, 'name') ?? project.name,
			description: readOptionalText(input, 'description') ?? project.description,
			status,
			repositoryUrl: readOptionalText(input, 'repositoryUrl') ?? project.repositoryUrl,
			environmentUrl: readOptionalText(input, 'environmentUrl') ?? project.environmentUrl,
			defaultBranch: readOptionalText(input, 'defaultBranch') ?? project.defaultBranch,
			refactorEveryDeploys: readRefactorEveryDeploys(input, project),
			database
		}
	};
}

function readStatus(input: Record<string, unknown>, project: Project): ProjectStatus | null {
	const status = readOptionalText(input, 'status');
	if (status === null) return project.status;
	if (projectStatusOrder.includes(status as ProjectStatus)) return status as ProjectStatus;
	return null;
}

function readDatabase(input: Record<string, unknown>, project: Project): ProjectDatabase | null {
	const { database } = project;
	const kind = readOptionalText(input, 'databaseKind') ?? database.kind;
	if (!isDatabaseKind(kind)) return null;
	return {
		kind,
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
	return parseRefactorEveryDeploys(input.refactorEveryDeploys);
}
