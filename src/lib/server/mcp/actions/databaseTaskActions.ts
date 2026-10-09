import {
	confirmDatabaseTaskRun,
	runConfirmations,
	type RunConfirmation
} from '$lib/server/databaseTasks/confirmDatabaseTaskRun';
import { databaseKindLabels } from '$lib/data/databaseKind';
import { databaseTaskInstruction } from '$lib/data/databaseTaskInstruction';
import { formatBritishDateTime } from '$lib/data/britishDate';
import { getDatabaseTaskRegister } from '$lib/server/databaseTasks/getDatabaseTaskRegister';
import { objectSchema, readText, textField } from '../actionTypes';
import { validateDatabaseTaskConfirmation } from '$lib/data/validateDatabaseTaskConfirmation';
import type { DatabaseTask } from '$lib/server/databaseTasks/databaseTaskRecord';
import type { McpAction } from '../actionTypes';

const databaseTaskDoctrine =
	'A migration is never run by a Claude: the admin runs it by hand, on the pfp or bb pattern ' +
	'(sqlcmd for an Azure SQL project, scripts/run-migration.sh for a Supabase one), then confirms ' +
	'it here or at /projects/database. Bring the pending list to your person, in order, with ' +
	'each command to copy; confirm one only when they say it has been run.';

export const databaseTaskActions: McpAction[] = [
	{
		name: 'list_database_tasks',
		area: 'projects',
		audience: 'admin',
		isWrite: false,
		summary: 'every migration a merged pull request brought that is still to be run, oldest first, with the command to run it',
		guidance: databaseTaskDoctrine,
		inputSchema: objectSchema({}),
		run: async (caller) => {
			const { pending } = await getDatabaseTaskRegister(caller.supabase);
			if (pending.length === 0) return 'Every migration that has merged has been run.';
			const closingLine = 'Confirm each with confirm_database_task_run once it has been run.';
			return [...pending.map(describePendingTask), '', closingLine].join('\n');
		}
	},
	{
		name: 'confirm_database_task_run',
		area: 'projects',
		audience: 'admin',
		isWrite: true,
		summary: 'record that the admin has run one migration, so it leaves the list of database tasks to run',
		guidance: databaseTaskDoctrine,
		inputSchema: objectSchema({ databaseTaskId: textField('The database task id, as list_database_tasks gives it') }, ['databaseTaskId']),
		run: async (caller, input) => {
			const taskId = readText(input, 'databaseTaskId');
			const problem = validateDatabaseTaskConfirmation(taskId);
			if (problem !== null) return problem;
			return describeConfirmation(await confirmDatabaseTaskRun(caller.supabase, taskId, caller.accountId));
		}
	}
];

function describePendingTask(task: DatabaseTask): string {
	const { database } = task;
	const instruction = databaseTaskInstruction(database, task);
	const kind = databaseKindLabels[database.kind];
	const fileLine = instruction.fileAddress === null ? '' : `\n  file: ${instruction.fileAddress}`;
	const commandLine = instruction.command === '' ? '\n  no database kind set on the project — edit it first' : `\n  run: ${instruction.command}`;
	return `- ${task.projectName} (${kind}): ${task.filePath}, merged ${formatBritishDateTime(task.raisedAt)}${commandLine}${fileLine}\n  (database task id: ${task.id})`;
}

function describeConfirmation(confirmation: RunConfirmation): string {
	if (confirmation.kind === runConfirmations.noSuchTask) {
		return 'No database task has that id. Call list_database_tasks for the ones to run.';
	}
	const { task } = confirmation;
	if (confirmation.kind === runConfirmations.alreadyRun) return `${task.filePath} on ${task.projectName} was already confirmed as run.`;
	return `${task.filePath} on ${task.projectName} is confirmed as run.`;
}
