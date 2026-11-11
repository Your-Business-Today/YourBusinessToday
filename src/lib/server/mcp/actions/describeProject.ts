import { assignedToYouLine } from '$lib/data/assignedTaskLine';
import { databaseKindLabels } from '$lib/data/databaseKind';
import { hasDatabase, migrationsFolderOf } from '$lib/data/projectDatabase';
import { personalProjectLabel } from '$lib/data/personalProject';
import { teamProjectLabel } from '$lib/data/teamProject';
import { goalSectionLines } from './describeGoal';
import { noRepositoryRecorded, repositoryPhrase } from './describeRepository';
import { projectStatusLabels } from '$lib/data/projectStatus';
import { backlogSideLines } from './describeBacklogSides';
import type { Goal } from '$lib/server/goals/goalRecord';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectSummary } from '$lib/server/projects/getProjectsForOwner';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

export const noSuchProject =
	'No project you are on has that id. Call list_projects for the ones you own and the ones you are on.';

type OpenWork = { openTaskCount: number; assignedTaskCount: number };

export function describeProjectLine(project: ProjectSummary): string {
	const status = projectStatusLabels[project.status];
	const place = `priority ${project.priority}, id: ${project.id}`;
	return `${project.name} — ${status}${forOrganisation(project)}, ${openWorkPhrase(project)} (${place})`;
}

/** " for The Construction Company", or ", personal" for a project under no organisation; a team project says so. */
export function forOrganisation(project: { organisationName: string; isTeamProject: boolean }): string {
	const teamPhrase = teamProjectPhrase(project.isTeamProject);
	if (project.organisationName !== '') return ` for ${project.organisationName}${teamPhrase}`;
	if (project.isTeamProject) return teamPhrase;
	return `, ${personalProjectLabel.toLowerCase()}`;
}

function teamProjectPhrase(isTeamProject: boolean): string {
	if (!isTeamProject) return '';
	return `, ${teamProjectLabel} project`;
}

/** "72 open", with ", 3 assigned to you" when any of it is the caller's. */
export function openWorkPhrase(project: OpenWork): string {
	const assignedLine = assignedToYouLine(project.assignedTaskCount);
	if (assignedLine === '') return `${project.openTaskCount} open`;
	return `${project.openTaskCount} open, ${assignedLine}`;
}

export function describeProject(
	project: Project,
	goals: Goal[],
	backlog: TaskTreeNode[],
	cadenceLine: string
): string {
	return [
		`${project.name} — ${projectStatusLabels[project.status]} (id: ${project.id})`,
		project.description === '' ? 'No description yet.' : project.description,
		codeLine(project, cadenceLine),
		databaseLine(project),
		'',
		...goalSectionLines(goals),
		...backlogSideLines(backlog, goals)
	].join('\n').trimEnd();
}

function codeLine(project: Project, cadenceLine: string): string {
	if (project.repositoryUrl === '') return `${noRepositoryRecorded}, so nothing is built or refactored by itself.`;
	return `${repositoryPhrase(project)}. ${cadenceLine}`;
}

function databaseLine(project: Project): string {
	const { database } = project;
	if (!hasDatabase(database)) return 'No database recorded.';
	return `Database: ${databaseKindLabels[database.kind]}, migrations in ${migrationsFolderOf(database)}, each run by GitHub when the merge that adds it lands.`;
}
