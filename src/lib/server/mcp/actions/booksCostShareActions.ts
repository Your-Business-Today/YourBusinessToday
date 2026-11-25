import { ukClockAt } from '$lib/data/ukClock';
import { describeMonth } from '$lib/data/books/monthKey';
import { readCostShares } from '$lib/server/books/costShareReading';
import { addCostShareMember, setCostShareMemberLeaving } from '$lib/server/books/costShareMembers';
import { setCostShare } from '$lib/server/books/costShareWrites';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, textField } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { costCentreIdField } from './booksChartFields';
import { costShareFields, sharingGuidance } from './booksCostShareFields';
import { describeCostShares } from './describeCostShares';
import type { McpAction } from '../actionTypes';

const todayOnUkClock = (): string => ukClockAt(new Date()).date;

const leavingText = (leftMonth: string | null): string => (leftMonth === null ? 'carries on sharing it' : `shares it to ${describeMonth(leftMonth)}`);

export const booksCostShareActions: McpAction[] = [
	moduleAction('books', {
		name: 'set_cost_share',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "share one of an organisation's cost centres among its projects, saying how many months each of its lines covers",
		guidance: sharingGuidance,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, costCentreId: costCentreIdField, monthsCovered: costShareFields.monthsCovered }, [
			'organisationId',
			'costCentreId',
			'monthsCovered'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const share = await setCostShare(caller.supabase, organisation.id, input.costCentreId, input.monthsCovered);
				return `Cost centre ${share.costCentreId} is shared among projects; each of its lines covers ${share.monthsCovered} month(s) from the month it is dated. add_cost_share_member adds the projects that share it.`;
			})
	}),
	moduleAction('books', {
		name: 'add_cost_share_member',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: 'add one of the organisation’s projects to a shared cost from the month it starts sharing it, and the month it stops, if known',
		guidance:
			'The project takes a share from the month it joins, and the projects already sharing it take less from that month; the months before stay as they were. ' +
			'For a store licence, the month it joins is the month its app goes on the store. A project shares through its own cost centre (set_cost_centre_project).',
		inputSchema: objectSchema(
			{
				organisationId: booksOrganisationField,
				costCentreId: costCentreIdField,
				projectId: costShareFields.projectId,
				joinedMonth: costShareFields.joinedMonth,
				leftMonth: costShareFields.leftMonth,
				weight: costShareFields.weight
			},
			['organisationId', 'costCentreId', 'projectId', 'joinedMonth']
		),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const { costCentreId, projectId, joinedMonth, leftMonth, weight } = input;
				const member = await addCostShareMember(caller.supabase, organisation.id, { costCentreId, projectId, joinedMonth, leftMonth, weight });
				return `Project ${member.projectId} shares cost centre ${input.costCentreId} from ${describeMonth(member.joinedMonth)} and ${leavingText(member.leftMonth)} (member ${member.id}).`;
			})
	}),
	moduleAction('books', {
		name: 'set_cost_share_member_leaving',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: 'set the last month a project shares a shared cost, such as when it is dropped, or clear it so it carries on',
		guidance:
			'From the month after, the projects still sharing it take up its part; when none is left the part is kept against no project. The months before stay as they were.',
		inputSchema: objectSchema({ organisationId: booksOrganisationField, memberId: costShareFields.memberId, leftMonth: costShareFields.leftMonth }, [
			'organisationId',
			'memberId'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const member = await setCostShareMemberLeaving(caller.supabase, organisation.id, input.memberId, input.leftMonth);
				return `Member ${member.id} ${leavingText(member.leftMonth)}.`;
			})
	}),
	moduleAction('books', {
		name: 'read_cost_shares',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: 'read every shared cost, the projects sharing each and when, and what each project took of it month by month for twelve months',
		guidance: `${sharingGuidance} Give the figures as they come; read_profit_by_cost_centre shows each project's share beside its own costs.`,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, toMonth: costShareFields.toMonth }, ['organisationId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const reading = await readCostShares(caller.supabase, organisation.id, todayOnUkClock(), input.toMonth);
				return describeCostShares(organisation.name, reading);
			})
	})
];
