import { accountAdminActions } from './accountAdminActions';
import { getDisplayNameOf } from '$lib/server/auth/getDisplayNameOf';
import { displayNameMaxLength, validateDisplayName } from '$lib/data/displayNameRules';
import { notificationActions } from './notificationActions';
import { objectSchema, readText, textField } from '../actionTypes';
import { saveDisplayNameFor } from '$lib/server/auth/saveDisplayNameFor';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const noNameSet = 'not set, so your email is shown';
const nameCleared = 'Your display name is cleared, so your email is shown instead.';

export const accountActions: McpAction[] = [
	{
		name: 'who_am_i',
		area: 'account',
		audience: 'everyone',
		isWrite: false,
		summary: 'Your email address, the name you go by, your standing here, and what that lets you do',
		inputSchema: objectSchema({}),
		run: async (caller) => describeAccount(caller)
	},
	{
		name: 'set_display_name',
		area: 'account',
		audience: 'everyone',
		isWrite: true,
		summary: 'change the name you go by on the site, as the account page does; blank goes back to your email',
		inputSchema: objectSchema({ displayName: textField(`The name, at most ${displayNameMaxLength} characters`) }, ['displayName']),
		run: async (caller, input) => changeDisplayName(caller, readText(input, 'displayName'))
	},
	...notificationActions,
	...accountAdminActions
];

async function describeAccount(caller: McpCaller): Promise<string> {
	const { ownedProjectIds, memberProjectIds } = caller;
	const displayName = await getDisplayNameOf(caller.supabase, caller.accountId);
	return [
		`Email: ${caller.email}`,
		`Name: ${displayName === '' ? noNameSet : displayName}`,
		`Standing: ${standingOf(caller)}`,
		`Projects: ${ownedProjectIds.length} owned, ${memberProjectIds.length} as a team member`
	].join('\n');
}

async function changeDisplayName(caller: McpCaller, displayName: string): Promise<string> {
	const refusal = validateDisplayName(displayName);
	if (refusal !== null) return refusal;
	await saveDisplayNameFor(caller.supabase, caller.accountId, displayName);
	if (displayName === '') return nameCleared;
	return `You now go by ${displayName}.`;
}

function standingOf(caller: McpCaller): string {
	if (caller.isAdmin) return 'administrator';
	if (caller.isStaff) return 'staff';
	return 'account holder';
}
