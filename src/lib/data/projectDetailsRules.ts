import { databaseKindOrder } from './databaseKind';
import { projectStatusOrder, type ProjectStatus } from './projectStatus';
import type { ProjectDatabase } from './projectDatabase';
import type { DeployTime } from './deployTime';

/** What a project says about itself on its edit form and its update_project_details action. */
export type ProjectDetails = {
	name: string;
	description: string;
	status: ProjectStatus;
	repositoryUrl: string;
	environmentUrl: string;
	defaultBranch: string;
	refactorEveryDeploys: number;
	deployStagingAt: DeployTime;
	database: ProjectDatabase;
};

/** The same details as they arrive, before the status and the database kind are known to be ones the columns allow. */
export type ProjectDetailsClaim = Omit<ProjectDetails, 'status' | 'deployStagingAt' | 'database'> & {
	status: string;
	deployStagingAt: string;
	database: Omit<ProjectDatabase, 'kind'> & { kind: string };
};

export const fewestDeploysBetweenRefactors = 0;
export const mostDeploysBetweenRefactors = 2147483647;

export const projectNeedsName = 'A project name is required.';
export const wrongStatus = `A project is ${projectStatusOrder.join(', ')}. Pick one of those.`;
export const wrongDatabaseKind = `A database is ${databaseKindOrder.join(', ')}. Pick one of those.`;
export const deploysBetweenRefactorsRefusal =
	`Refactor every … deploys is a whole number from ${fewestDeploysBetweenRefactors} ` +
	`to ${mostDeploysBetweenRefactors}; 0 turns the reminder off.`;

/** The number as written, never rounded: anything that is not a number reads as NaN, so the check refuses it. */
export function deploysBetweenRefactorsFrom(value: unknown): number {
	const written = String(value ?? '').trim();
	if (written === '') return Number.NaN;
	return Number(written);
}

export function isDeploysBetweenRefactors(count: number): boolean {
	const isWithinColumn = count >= fewestDeploysBetweenRefactors && count <= mostDeploysBetweenRefactors;
	return Number.isInteger(count) && isWithinColumn;
}
