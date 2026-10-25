import { isDatabaseKind } from './databaseKind';
import { deployTimeOf, deployTimeRefusal, isDeployTime } from './deployTime';
import { projectDatabaseRefusal } from './projectDatabase';
import { isProjectStatus } from './projectStatus';
import {
	deploysBetweenRefactorsRefusal,
	isDeploysBetweenRefactors,
	projectNeedsName,
	wrongDatabaseKind,
	wrongStatus,
	type ProjectDetails,
	type ProjectDetailsClaim
} from './projectDetailsRules';

export type ProjectDetailsEdit = { update: ProjectDetails } | { refusal: string };

/** The details as the projects columns will hold them, or a sentence naming the value they cannot. */
export function validateProjectDetails(claim: ProjectDetailsClaim): ProjectDetails | string {
	const { status, deployStagingAt, database } = claim;
	const { kind } = database;
	if (claim.name === '') return projectNeedsName;
	if (!isProjectStatus(status)) return wrongStatus;
	if (!isDeploysBetweenRefactors(claim.refactorEveryDeploys)) return deploysBetweenRefactorsRefusal;
	if (!isDeployTime(deployStagingAt)) return deployTimeRefusal;
	if (!isDatabaseKind(kind)) return wrongDatabaseKind;
	const checkedDatabase = { ...database, kind };
	const databaseRefusal = projectDatabaseRefusal(checkedDatabase);
	if (databaseRefusal !== null) return databaseRefusal;
	return { ...claim, status, deployStagingAt: deployTimeOf(deployStagingAt), database: checkedDatabase };
}

export function projectDetailsEditOf(claim: ProjectDetailsClaim): ProjectDetailsEdit {
	const checked = validateProjectDetails(claim);
	if (typeof checked === 'string') return { refusal: checked };
	return { update: checked };
}
