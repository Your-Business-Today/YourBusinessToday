import { CostShareLimits } from '$lib/data/books/sharing/costShare';
import { textField } from '../actionTypes';

export const costShareFields = {
	monthsCovered: {
		type: 'integer',
		minimum: CostShareLimits.fewestMonthsCovered,
		maximum: CostShareLimits.mostMonthsCovered,
		description:
			'How many months each line kept within the cost centre pays for, counted from the month it is dated: 1 for a monthly licence, 12 for a yearly one'
	},
	projectId: textField("The project that shares the cost, by its id as list_projects gives it, one of the organisation's own"),
	joinedMonth: textField('The first month the project shares the cost, written as 2026-07'),
	leftMonth: textField('Leave out while it carries on, or the last month it shares the cost, written as 2027-03'),
	memberId: textField('The project’s place in the shared cost, by its member id as read_cost_shares gives it'),
	toMonth: textField('Leave out for this month, or the last of the twelve months to read, written as 2026-11')
};

export const sharingGuidance =
	'A shared cost is a cost centre several projects share, such as a store licence or a hosting plan. Its lines reach it as any line does, ' +
	"by the supplier's bank rule. Each line is spread over the months it covers, and each month's part is split equally among the projects " +
	'sharing it that month, so a project that joins lowers the others’ share from that month, and earlier months stay as they were. A cost that ' +
	"belongs to one project is kept in that project's own cost centre instead.";
