import { defaultBranchWhenUnset, refactorEveryDeploysWhenUnset } from './projectRecord';
import { deploysBetweenRefactorsFrom, type ProjectDetailsClaim } from '$lib/data/projectDetailsRules';
import { projectDetailsEditOf, type ProjectDetailsEdit } from '$lib/data/validateProjectDetails';

/** The edit form as one update, checked against the projects columns before anything is saved. */
export function parseProjectDetailsForm(formData: FormData): ProjectDetailsEdit {
	return projectDetailsEditOf({
		name: text(formData, 'name'),
		description: text(formData, 'description'),
		status: text(formData, 'status'),
		repositoryUrl: text(formData, 'repositoryUrl'),
		environmentUrl: text(formData, 'environmentUrl'),
		defaultBranch: text(formData, 'defaultBranch') || defaultBranchWhenUnset,
		refactorEveryDeploys: readDeploysBetweenRefactors(text(formData, 'refactorEveryDeploys')),
		deployStagingAt: text(formData, 'deployStagingAt'),
		database: readDatabaseForm(formData)
	});
}

function readDatabaseForm(formData: FormData): ProjectDetailsClaim['database'] {
	return {
		kind: text(formData, 'databaseKind'),
		server: text(formData, 'databaseServer'),
		name: text(formData, 'databaseName'),
		user: text(formData, 'databaseUser'),
		migrationsPath: text(formData, 'migrationsPath')
	};
}

function readDeploysBetweenRefactors(written: string): number {
	if (written === '') return refactorEveryDeploysWhenUnset;
	return deploysBetweenRefactorsFrom(written);
}

function text(formData: FormData, field: string): string {
	return String(formData.get(field) ?? '').trim();
}
