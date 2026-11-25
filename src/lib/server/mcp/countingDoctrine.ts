import { openWorkToolName } from './openWorkToolName';

/** How a question of how much someone has is answered: from the real count, never a ranked view. */
export const countingDoctrine = [
	'Counting what someone has:',
	'- How many, or what, someone has — tasks, asks, to-dos, themselves or anyone on their projects —',
	`  is answered with ${openWorkToolName}: the real count across every project, every department and`,
	'  status, each item listed. A count is never read off the one-item turn, a filtered list or the',
	'  team’s internal jobs list, and nobody is said to have none without it.',
	'- Whose move a task is follows one rule everywhere: everyone an open ask on it waits on; else a',
	'  build is Claude\u2019s, never a person\u2019s; else whoever asked, once their ask is answered and',
	'  until they speak again; else everyone assigned; else whoever raised it. A question for someone',
	'  is posted waiting on them (waitingOn), so the move is theirs and leaves the assignee\u2019s list.',
	'- A task several people must act on is given to all of them (add_task_assignees keeps whoever',
	'  is already on it), so it is counted for each, and each question for them is an ask of its own.'
];
