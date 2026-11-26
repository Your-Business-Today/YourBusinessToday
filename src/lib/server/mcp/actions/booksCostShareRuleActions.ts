import { CostShareMembersBy } from '$lib/data/books/sharing/costShareMembersBy';
import { setCostShareMembersBy } from '$lib/server/books/costShareRule';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { costCentreIdField } from './booksChartFields';
import type { McpAction } from '../actionTypes';

const membersByField = {
	type: 'string',
	enum: Object.values(CostShareMembersBy),
	description:
		'live_projects: every project of the organisation that is building, testing or in maintenance shares it, month by month; named: only the projects add_cost_share_member names'
};

const ruleGuidance =
	'Use live_projects for a cost every live project uses, such as a hosting plan, so the split follows the projects without anyone changing the shared cost: ' +
	'a project put on hold or completed shares the month it happened and leaves from the month after, and one moved into building joins that month. ' +
	"A project's status is kept month by month from 25 Nov 2026; the months before are read with the status it had then.";

const answers = {
	[CostShareMembersBy.liveProjects]: 'is shared by every live project of the organisation, month by month, from their status',
	[CostShareMembersBy.named]: 'is shared by the projects named as its members'
};

export const booksCostShareRuleActions: McpAction[] = [
	moduleAction('books', {
		name: 'set_cost_share_members_by',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: 'choose whether a shared cost is shared by every live project, from their status, or by the projects named as its members',
		guidance: ruleGuidance,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, costCentreId: costCentreIdField, membersBy: membersByField }, [
			'organisationId',
			'costCentreId',
			'membersBy'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const share = await setCostShareMembersBy(caller.supabase, organisation.id, input.costCentreId, input.membersBy);
				return `Cost centre ${share.cost_centre_id} ${answers[share.members_by]}.`;
			})
	})
];
