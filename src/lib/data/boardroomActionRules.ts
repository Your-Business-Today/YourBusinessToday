import { departmentLabels, departmentOrder, isDevelopment, type Department } from './department';
import { todoLimits } from './todo';

/** The limits of boardroom_actions (migration 0194), stated once for the service and the form. */
export const boardActionLimits = {
	longestWhat: todoLimits.longestTitle,
	longestOwnerName: 320,
	longestProjectName: 500
} as const;

/** The departments whose tasks a person does: a development task is built, never asked of a person. */
export const actionDepartments: Department[] = departmentOrder.filter((department) => !isDevelopment(department));

const departmentNames = actionDepartments.join(', ');

export const boardActionRefusals = {
	whatMissing: `what is the action to be done, short enough for a task's title: 1 to ${boardActionLimits.longestWhat} characters.`,
	ownerMissing: 'owner is the person who owns the action: their account id, name or email, as read_organisation lists its people.',
	dueOnNotADate: 'dueOn is the date the action is due, if one was given: a real date written as YYYY-MM-DD.',
	projectNotAnId: 'projectId is the id of a project under this organisation, as read_organisation lists its projects; leave it out for none.',
	departmentUnknown: `department is the department of the project the action is done in: one of ${departmentNames}.`,
	departmentWithoutProject: 'department is given only with a project: an action with no project goes on its owner’s own to-do list.',
	developmentNotAsked:
		`A development task is not raised from a meeting: building is never asked of a person. Name the job a person does, in one of ${departmentNames}.`,
	projectNotOfOrganisation: 'That project is not under this organisation, so its board takes no action from this meeting.',
	ownerNotOnProject: 'That person is not on the project, so a task there cannot be theirs. Name someone on it.',
	ownerNotOnOrganisation: 'That person is not on this organisation, so the action cannot go on their to-do list.',
	meetingNotOpen: 'Actions are recorded while their meeting is open.',
	itemNotOnAgenda: 'That number is not an item on the agenda as read_board_meeting gives it now.',
	itemNotForDecision: 'Actions are recorded on an item for decision: they go with the decision the directors confirm.',
	itemNotAgreed: 'That item came out of the room not agreed, so it has no decision for actions to go with.',
	decisionAlreadyAnswered:
		'A director has answered this decision already, so its actions are fixed. A change is a replacing decision at a later meeting, with its own actions.',
	callerHasNoSeat: 'Only a sitting director who was on this meeting records its actions.',
	claudeHoldsBack:
		'Your director’s Claude is paused or set to ask them first on this meeting, so it records no action. Your director records it on the meeting page.',
	nothingToRaise: 'Every action of a carried decision on this meeting is on its board already; nothing was raised.',
} as const;

export function isFittingWhat(what: string): boolean {
	return what !== '' && what.length <= boardActionLimits.longestWhat;
}

export function departmentLabelOf(department: Department): string {
	return departmentLabels[department];
}
