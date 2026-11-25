import { describeMonth } from '$lib/data/books/monthKey';
import { CostShareSplitBy } from '$lib/data/books/sharing/costShareUsage';
import { CostShareUsageLimits } from '$lib/data/books/sharing/costShareUsageRules';
import { recordCostShareUsage, setCostShareSplitBy } from '$lib/server/books/costShareUsageWrites';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, textField } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { costCentreIdField } from './booksChartFields';
import type { McpAction } from '../actionTypes';

const readingsField = {
	type: 'array',
	maxItems: CostShareUsageLimits.mostReadings,
	items: objectSchema(
		{
			projectId: textField("The project that used the cost, by its id as list_projects gives it, one of the organisation's own"),
			usage: { type: 'number', minimum: 0, maximum: CostShareUsageLimits.largestUsage, description: 'What it used that month, such as 12.03 for $12.03 of Vercel usage' }
		},
		['projectId', 'usage']
	),
	description: 'One reading for each project that used the cost that month; an empty list clears the month, which is then split equally'
};

const usageGuidance =
	"Read each project's usage from the supplier's bill with its own CLI or connector: for Vercel `vercel billing usage --group-by project`, for Supabase each project's compute on the organisation's usage page. " +
	'Match each to its YBT project by name and record the figures as they come, in one unit for the month. Each month is split in proportion to the readings among the projects sharing the cost; ' +
	'a reading for a project not sharing it that month takes no part. A month with no reading is split equally, and read_cost_shares says so.';

export const booksCostShareUsageActions: McpAction[] = [
	moduleAction('books', {
		name: 'set_cost_share_split_by',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "choose whether a shared cost's months are split by each month's usage readings or by the projects' weights, equal where none is set",
		guidance: usageGuidance,
		inputSchema: objectSchema(
			{
				organisationId: booksOrganisationField,
				costCentreId: costCentreIdField,
				splitBy: { type: 'string', enum: Object.values(CostShareSplitBy), description: 'usage: by each month’s readings; weight: by the projects’ weights' }
			},
			['organisationId', 'costCentreId', 'splitBy']
		),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				await setCostShareSplitBy(caller.supabase, organisation.id, input.costCentreId, input.splitBy);
				return `Cost centre ${input.costCentreId} is split by ${input.splitBy} from now on; months already closed keep the split they closed with.`;
			})
	}),
	moduleAction('books', {
		name: 'record_cost_share_usage',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "record each project's usage of a shared cost in a month, from the supplier's bill, in place of any readings kept for that month",
		guidance: usageGuidance,
		inputSchema: objectSchema(
			{ organisationId: booksOrganisationField, costCentreId: costCentreIdField, month: textField('The month the readings are for, written as 2026-11'), readings: readingsField },
			['organisationId', 'costCentreId', 'month', 'readings']
		),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const { costCentreId, month, readings } = input;
				const kept = await recordCostShareUsage(caller.supabase, organisation.id, { costCentreId, month, readings });
				return `${kept.length} usage reading(s) kept for ${describeMonth(month as string)}; that month of cost centre ${costCentreId} is split by them.`;
			})
	})
];
