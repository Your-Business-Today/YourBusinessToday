import { describeMonth } from '$lib/data/books/monthKey';
import { MemberSyncLimits, syncCostShareMembers, type MemberSyncResult } from '$lib/server/books/costShareSync';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, textField } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { costCentreIdField } from './booksChartFields';
import type { McpAction } from '../actionTypes';

const projectIdsField = {
	type: 'array',
	maxItems: MemberSyncLimits.mostProjects,
	items: textField("A project using the cost that month, by its id as list_projects gives it, one of the organisation's own"),
	description: 'Every project using the cost in the month, such as each project live on Vercel or with a Supabase database; an empty list ends every spell'
};

const syncGuidance =
	'Read who uses the cost from the supplier first, with its own CLI or connector: for Vercel the projects deployed on the team ' +
	'(vercel project ls, or vercel billing usage --group-by project), for Supabase the databases on the organisation (supabase projects list). ' +
	'Match each to its YBT project by name and pass their ids. Tell the person about any supplier project that matches no YBT project, ' +
	'so it can be tied to a project or deleted. Every month before the one given stays as it was.';

export const booksCostShareSyncActions: McpAction[] = [
	moduleAction('books', {
		name: 'sync_cost_share_members',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: 'make exactly the projects given share a shared cost from a month on: the new ones join that month and the rest stop the month before',
		guidance: syncGuidance,
		inputSchema: objectSchema(
			{
				organisationId: booksOrganisationField,
				costCentreId: costCentreIdField,
				month: textField('The first month the list holds for, written as 2026-12'),
				projectIds: projectIdsField
			},
			['organisationId', 'costCentreId', 'month', 'projectIds']
		),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const { costCentreId, month, projectIds } = input;
				return describeSync(await syncCostShareMembers(caller.supabase, organisation.id, { costCentreId, month, projectIds }));
			})
	})
];

function describeSync(result: MemberSyncResult): string {
	const { month, plan, projectNames } = result;
	const named = (projectId: string) => projectNames.get(projectId) ?? projectId;
	const listed = (projectIds: string[]) => (projectIds.length === 0 ? 'none' : projectIds.map(named).join(', '));
	return [
		`From ${describeMonth(month)} the cost is shared by the projects given; the months before stay as they were.`,
		`- Joining in ${describeMonth(month)}: ${listed(plan.joining)}`,
		`- Stopping the month before: ${listed(plan.leaving.map((spell) => spell.projectId))}`,
		`- Taken off, as they had only joined in ${describeMonth(month)}: ${listed(plan.removed.map((spell) => spell.projectId))}`,
		`- Already sharing: ${listed(plan.staying)}`,
		`- Already set to join later, left to join then: ${listed(plan.joiningLater)}`
	].join('\n');
}
