import { accountActions } from './actions/accountActions';
import { clientActions } from './actions/clientActions';
import { conversationActions } from './actions/conversationActions';
import { goalActions } from './actions/goalActions';
import { projectActions } from './actions/projectActions';
import { projectMembershipActions } from './actions/projectMembershipActions';
import { projectPeopleActions } from './actions/projectPeopleActions';
import { supportTaskActions } from './actions/supportTaskActions';
import { taskActions } from './actions/taskActions';
import { actionAudiences, type ActionArea, type McpAction } from './actionTypes';
import type { AccountStanding } from './resolveAccountStanding';

const everyAction: McpAction[] = [
	...accountActions,
	...clientActions,
	...projectActions,
	...projectPeopleActions,
	...projectMembershipActions,
	...goalActions,
	...supportTaskActions,
	...conversationActions,
	...taskActions
];

export function actionsFor(standing: AccountStanding, area: ActionArea | null): McpAction[] {
	return everyAction
		.filter((action) => isForAudience(action, standing))
		.filter((action) => area === null || action.area === area)
		.sort((left, right) => left.name.localeCompare(right.name));
}

export function findAction(name: string, standing: AccountStanding): McpAction | null {
	return actionsFor(standing, null).find((action) => action.name === name) ?? null;
}

export function areasFor(standing: AccountStanding): ActionArea[] {
	return [...new Set(actionsFor(standing, null).map((action) => action.area))];
}

function isForAudience(action: McpAction, standing: AccountStanding): boolean {
	if (action.audience === actionAudiences.everyone) return true;
	if (action.audience === actionAudiences.admin) return standing.isAdmin;
	return standing.isStaff;
}
