import type { PublishedSkill, SkillArea } from '$lib/data/publishedSkill';
import { actionsFor } from '$lib/server/mcp/actionRegistry';
import type { ActionArea, McpAction } from '$lib/server/mcp/actionTypes';
import type { AccountStanding } from '$lib/server/mcp/resolveAccountStanding';
import { skillAreaLabels, skillAreaOrder } from './skillAreas';

/** An account that is neither staff nor an administrator: the skills it is offered are the ones every account's Claude follows. */
const everyAccount: AccountStanding = {
	accountId: '',
	email: '',
	isAdmin: false,
	isStaff: false,
	ownedProjectIds: [],
	memberProjectIds: [],
	organisationMemberships: []
};

/** Every skill a person's Claude follows on the site, area by area, as the connector hands it to their Claude. */
export function publishedSkillAreas(): SkillArea[] {
	const actions = actionsFor(everyAccount, null);
	return skillAreaOrder
		.map((area) => skillAreaOf(area, actions))
		.filter((skillArea) => skillArea.skillCount > 0);
}

function skillAreaOf(area: ActionArea, actions: McpAction[]): SkillArea {
	const skills = actions.filter((action) => action.area === area).map(publishedSkillOf);
	return { label: skillAreaLabels[area], skills, skillCount: skills.length };
}

function publishedSkillOf(action: McpAction): PublishedSkill {
	return {
		name: action.name,
		summary: action.summary,
		howItWorks: action.guidance ?? null,
		isWrite: action.isWrite
	};
}
