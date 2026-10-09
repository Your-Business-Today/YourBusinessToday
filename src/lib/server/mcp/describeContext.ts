import { actionsFor, areasFor } from './actionRegistry';
import { raisingDoctrine } from './raisingDoctrine';
import { workingDoctrine } from './workingDoctrine';
import type { McpCaller } from './resolveMcpCaller';

export function describeContext(caller: McpCaller): string {
	return [
		`Signed in as ${caller.email}.`,
		projectsLine(caller),
		staffLine(caller),
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

function countOf(count: number, noun: string): string {
	if (count === 0) return `no ${noun}s`;
	if (count === 1) return `one ${noun}`;
	return `${count} ${noun}s`;
}
