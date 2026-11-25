import { describeMonth } from '$lib/data/books/monthKey';
import { addCostCentreMember } from '$lib/server/books/costShareCostCentreMembers';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, textField } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { costCentreIdField } from './booksChartFields';
import { costShareFields } from './booksCostShareFields';
import type { McpAction } from '../actionTypes';

const costCentreMemberGuidance =
	'For a part that belongs to no YBT project, such as the on-hold sites of a group of companies kept in their own cost centre. ' +
	'It shares beside the projects, by the rule or by name, and takes its part by weight or usage like any member; set_cost_share_member_leaving ends its spell.';

export const booksCostShareCostCentreActions: McpAction[] = [
	moduleAction('books', {
		name: 'add_cost_share_cost_centre_member',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: 'add a cost centre that has no project to a shared cost from a month, so it takes a part beside the projects sharing it',
		guidance: costCentreMemberGuidance,
		inputSchema: objectSchema(
			{
				organisationId: booksOrganisationField,
				costCentreId: costCentreIdField,
				memberCostCentreId: textField('The cost centre that takes a part, by its id as list_cost_centres gives it'),
				joinedMonth: costShareFields.joinedMonth,
				leftMonth: costShareFields.leftMonth,
				weight: costShareFields.weight
			},
			['organisationId', 'costCentreId', 'memberCostCentreId', 'joinedMonth']
		),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const { costCentreId, memberCostCentreId, joinedMonth, leftMonth, weight } = input;
				const member = await addCostCentreMember(caller.supabase, organisation.id, { costCentreId, memberCostCentreId, joinedMonth, leftMonth, weight });
				return `Cost centre ${memberCostCentreId} shares cost centre ${costCentreId} from ${describeMonth(member.joinedMonth)} (member ${member.id}).`;
			})
	})
];
