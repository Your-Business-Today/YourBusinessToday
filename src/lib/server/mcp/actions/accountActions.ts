import { objectSchema } from '../actionTypes';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const accountActions: McpAction[] = [
	{
		name: 'who_am_i',
		area: 'account',
		audience: 'everyone',
		isWrite: false,
		summary: 'Your email address, your standing here, and what that lets you do',
		inputSchema: objectSchema({}),
		run: async (caller) => describeAccount(caller)
	}
];

function describeAccount(caller: McpCaller): string {
	const { ownedProjectIds, memberProjectIds } = caller;
	return [
		`Email: ${caller.email}`,
		`Standing: ${standingOf(caller)}`,
		`Projects: ${ownedProjectIds.length} owned, ${memberProjectIds.length} as a team member`
	].join('\n');
}

function standingOf(caller: McpCaller): string {
	if (caller.isAdmin) return 'administrator';
	if (caller.isStaff) return 'staff';
	return 'account holder';
}
