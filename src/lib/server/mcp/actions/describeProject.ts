import { assignedToYouLine } from '$lib/data/assignedTaskLine';
import { databaseKindLabels } from '$lib/data/databaseKind';
import { hasDatabase, migrationsFolderOf } from '$lib/data/projectDatabase';
import { goalSectionLines } from './describeGoal';
import { projectStatusLabels } from '$lib/data/projectStatus';
import { taskKindLabels, taskStatusLabelFor } from '$lib/data/taskKind';
import type { Goal } from '$lib/server/goals/goalRecord';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectSummary } from '$lib/server/projects/getProjectsForOwner';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

export const noSuchProject =
	'No project you are on has that id. Call list_projects for the ones you own and the ones you are on.';

const subtaskIndent = '  ';

type OpenWork = { openTaskCount: number; assignedTaskCount: number };

export function describeProjectLine(project: ProjectSummary): string {
	const status = projectStatusLabels[project.status];
	const place = `priority ${project.priority}, id: ${project.id}`;
	return `${project.name} — ${status}, ${openWorkPhrase(project)} (${place})`;
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
		'Backlog, in priority order (a subtask\u2019s priority is its place under its parent):',
		...backlogLines(backlog, goals)
	].join('\n');
}

function codeLine(project: Project, cadenceLine: string): string {
	if (project.repositoryUrl === '') return 'No repository recorded, so nothing is built or refactored by itself.';
	return `Code: ${project.repositoryUrl} (deploys from ${project.defaultBranch}). ${cadenceLine}`;
}

function databaseLine(project: Project): string {
	const { database } = project;
	if (!hasDatabase(database)) return 'No database recorded, so a migration it merges raises no database task.';
	return `Database: ${databaseKindLabels[database.kind]}, migrations in ${migrationsFolderOf(database)} — each one a merge adds is a database task for the admin to run.`;
}

function backlogLines(tasks: TaskTreeNode[], goals: Goal[]): string[] {
	if (tasks.length === 0) return ['Nothing in the backlog yet.'];
	return tasks.flatMap((task) => taskLines(task, '', goals));
}

function taskLines(task: TaskTreeNode, indent: string, goals: Goal[]): string[] {
	return [
		taskLine(task, indent, goals),
		...task.subtasks.flatMap((subtask) => taskLines(subtask, `${indent}${subtaskIndent}`, goals))
	];
}

function taskLine(task: TaskTreeNode, indent: string, goals: Goal[]): string {
	const status = taskStatusLabelFor(task.kind, task.status);
	const goal = goals.find((candidate) => candidate.id === task.goalId);
	const underGoal = goal === undefined ? '' : `, under "${goal.title}"`;
	return `${indent}${task.title} — ${taskKindLabels[task.kind]} task, ${status}, ${task.storyPoints} points${underGoal} (priority ${task.priority}, id: ${task.id})`;
}
