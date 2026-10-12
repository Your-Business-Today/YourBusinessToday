import { accountActions } from './actions/accountActions';
import { areaFeedActions } from './actions/areaFeedActions';
import { claimActions } from './actions/claimActions';
import { clientActions } from './actions/clientActions';
import { conversationActions } from './actions/conversationActions';
import { filingActions } from './actions/filingActions';
import { goalActions } from './actions/goalActions';
import { observationActions } from './actions/observationActions';
import { organisationActions } from './actions/organisationActions';
import { patchActions } from './actions/patchActions';
import { patchCompanyActions } from './actions/patchCompanyActions';
import { patchLeadActions } from './actions/patchLeadActions';
import { premisesActions } from './actions/premisesActions';
import { projectActions } from './actions/projectActions';
import { projectMembershipActions } from './actions/projectMembershipActions';
import { projectPeopleActions } from './actions/projectPeopleActions';
import { registerActions } from './actions/registerActions';
import { sectorActions } from './actions/sectorActions';
import { sightingActions } from './actions/sightingActions';
import { sightingLeadActions } from './actions/sightingLeadActions';
import { supportTaskActions } from './actions/supportTaskActions';
import { taskActions } from './actions/taskActions';
import { waitingActions } from './actions/waitingActions';
import { actionAudiences, type ActionArea, type McpAction } from './actionTypes';
import type { AccountStanding } from './resolveAccountStanding';

const everyAction: McpAction[] = [
	...accountActions,
	...clientActions,
	...organisationActions,
	...patchActions,
	...patchCompanyActions,
	...patchLeadActions,
	...registerActions,
	...filingActions,
	...sectorActions,
	...claimActions,
	...sightingActions,
	...sightingLeadActions,
	...premisesActions,
	...areaFeedActions,
	...observationActions,
	...projectActions,
	...projectPeopleActions,
	...projectMembershipActions,
	...goalActions,
	...supportTaskActions,
	...conversationActions,
	...waitingActions,
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
