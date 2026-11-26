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
	'It shares beside the projects, by the rule or by name, and takes its part by weight or usage like any member; set_cost_share_member_leaving ends its spell. ' +
	"For a part that is a director's own, such as their personal projects on a shared plan, name their director's loan account (2300): " +
	"the part then leaves the company's costs, moved onto that loan month by month by post_cost_share_directors_loan. Name the cost centre for what it is, such as Personal share, never for whose it is.";

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
				weight: costShareFields.weight,
				directorsLoanAccountId: textField(
					"Leave out for a part the company keeps; for a director's own part, the director's loan account it goes to, by its id as read_chart_of_accounts gives it"
				)
			},
			['organisationId', 'costCentreId', 'memberCostCentreId', 'joinedMonth']
		),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const { costCentreId, memberCostCentreId, joinedMonth, leftMonth, weight, directorsLoanAccountId } = input;
				const request = { costCentreId, memberCostCentreId, joinedMonth, leftMonth, weight, directorsLoanAccountId };
				const member = await addCostCentreMember(caller.supabase, organisation.id, request);
				const onLoan = member.directorsLoanAccountId === null ? '' : ", its part kept on the director's loan";
				return `Cost centre ${memberCostCentreId} shares cost centre ${costCentreId} from ${describeMonth(member.joinedMonth)}${onLoan} (member ${member.id}).`;
			})
	})
];
