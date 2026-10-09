import { actionsFor, areasFor } from './actionRegistry';
import { countPendingDatabaseTasks } from '$lib/server/databaseTasks/getDatabaseTaskRegister';
import { raisingDoctrine } from './raisingDoctrine';
import { workingDoctrine } from './workingDoctrine';
import type { McpCaller } from './resolveMcpCaller';

export async function describeContext(caller: McpCaller): Promise<string> {
	return [
		`Signed in as ${caller.email}.`,
		projectsLine(caller),
		staffLine(caller),
		await databaseTasksLine(caller),
		`Areas you can reach: ${areasFor(caller).join(', ')}.`,
		`${actionsFor(caller, null).length} actions are available to you — call list_actions to see them.`,
		'',
		workingDoctrine,
		'',
		raisingDoctrine
	]
		.filter((line) => line !== null)
		.join('\n');
}

function projectsLine(caller: McpCaller): string {
	const { ownedProjectIds, memberProjectIds } = caller;
	const owned = countOf(ownedProjectIds.length, 'project');
	const joined = countOf(memberProjectIds.length, 'project');
	return `You own ${owned} and are on the team of ${joined}. Everyone on a project works and manages it; only its owner can hand it on.`;
}

function staffLine(caller: McpCaller): string | null {
	if (caller.isAdmin)
		return 'You are an administrator at Your Business Today, with the clients register and admin as well.';
	if (caller.isStaff)
		return 'You are staff at Your Business Today, with the clients register as well.';
	return null;
}

async function databaseTasksLine(caller: McpCaller): Promise<string | null> {
	if (!caller.isAdmin) return null;
	const pendingCount = await countPendingDatabaseTasks(caller.supabase);
	if (pendingCount === 0) return null;
	const noun = pendingCount === 1 ? 'migration waits' : 'migrations wait';
	return `${pendingCount} ${noun} to be run on the database task list — call list_database_tasks, bring each command to the admin in order, and confirm each with confirm_database_task_run once they say it has been run.`;
}

function countOf(count: number, noun: string): string {
	if (count === 0) return `no ${noun}s`;
	if (count === 1) return `one ${noun}`;
	return `${count} ${noun}s`;
}
