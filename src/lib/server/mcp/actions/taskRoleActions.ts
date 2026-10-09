import { reachableTask } from '../projectAccess';
import { assignableTaskRoles, parseTaskRoles } from '$lib/data/taskRoles';
import { noSuchTask } from './describeTask';
import { objectSchema, readText, textField } from '../actionTypes';
import { setTaskRoles } from '$lib/server/projects/setTaskRoles';
import type { McpAction } from '../actionTypes';

const rolesOnOffer = `The roles are ${assignableTaskRoles.join(', ')}.`;

export const taskRoleActions: McpAction[] = [
	{
		name: 'set_task_roles',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'say which kinds of work a task needs — the roles, not the people',
		guidance:
			`${rolesOnOffer} This replaces the whole list, so name every role the task needs. ` +
			'An empty list clears them. Roles say what skills the work calls for; ' +
			'set_task_assignees says who is doing it.',
		inputSchema: objectSchema(
			{
				taskId: textField('The task id'),
				roles: {
					type: 'array',
					items: { type: 'string', enum: assignableTaskRoles },
					description: 'Every role the task needs'
				}
			},
			['taskId', 'roles']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const requestedRoles = parseRequestedRoles(input);
			if (requestedRoles === null) return `Pass roles as a list. ${rolesOnOffer}`;
			const roles = parseTaskRoles(requestedRoles);
			if (roles.length !== requestedRoles.length)
				return `Not all of those are roles. ${rolesOnOffer}`;
			await setTaskRoles(caller.supabase, task.id, roles);
			return `"${task.title}" now needs ${rolesSentence(roles)}.`;
		}
	}
];

function parseRequestedRoles(input: Record<string, unknown>): string[] | null {
	const roles = input.roles;
	if (!Array.isArray(roles)) return null;
	return [...new Set(roles.map(String))];
}

function rolesSentence(roles: string[]): string {
	if (roles.length === 0) return 'no particular role';
	return roles.join(', ');
}
