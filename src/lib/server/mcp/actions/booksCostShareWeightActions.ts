import { describeMonth } from '$lib/data/books/monthKey';
import { setCostShareMemberWeight } from '$lib/server/books/costShareMemberWeights';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, textField } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { costShareFields } from './booksCostShareFields';
import type { McpAction } from '../actionTypes';

const weightGuidance =
	"Each month's part of the shared cost is split in proportion to the weights of the projects sharing it that month: weight 3 beside weight 1 takes three quarters. " +
	'A change counts from the month given, like joining, and every month before stays as it was; read_cost_shares shows each spell and its weight.';

export const booksCostShareWeightActions: McpAction[] = [
	moduleAction('books', {
		name: 'set_cost_share_member_weight',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: 'give a project sharing a cost a weight from a month, such as the seats it uses or a set proportion, so its part is reckoned by it',
		guidance: weightGuidance,
		inputSchema: objectSchema(
			{
				organisationId: booksOrganisationField,
				memberId: costShareFields.memberId,
				fromMonth: textField('The first month the new weight counts, one the member shares the cost, written as 2026-07'),
				weight: { ...costShareFields.weight, description: 'The weight its part is reckoned by, such as 3 for three seats, to four decimal places' }
			},
			['organisationId', 'memberId', 'fromMonth', 'weight']
		),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const { memberId, fromMonth, weight } = input;
				const spells = await setCostShareMemberWeight(caller.supabase, organisation.id, { memberId, fromMonth, weight });
				const lines = spells.map((spell) => `- member ${spell.id}: weight ${spell.weight} from ${describeMonth(spell.joinedMonth)}`);
				return [`The project's part is reckoned by weight ${weight} from ${describeMonth(fromMonth as string)}; the months before stay as they were.`, ...lines].join('\n');
			})
	})
];
