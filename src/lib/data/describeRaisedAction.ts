import { ukMeetingTime } from './ukMeetingTime';
import type { CarriedAction } from './carriedActions';
import type { BoardroomMeeting } from './boardroomMeeting';

/** The meeting an action is raised from, as the task's details and the to-do's notes name it. */
export type RaisingOccasion = { meeting: BoardroomMeeting; organisationName: string; raisedBy: string };

/** What the task or to-do says of where it came from: the meeting, the item, the decision and the action. */
export function raisedFromWords(occasion: RaisingOccasion, carried: CarriedAction): string {
	const { meeting, organisationName } = occasion;
	const { action } = carried;
	const at = `Agreed at the board meeting of ${organisationName} on ${ukMeetingTime(meeting.meetsAt)} (UK time), meeting ${meeting.id}.`;
	const item = `Item ${carried.itemNumber}, “${carried.itemTitle}”: decision ${carried.decisionId}, “${carried.wording}”.`;
	return `${at}\n${item}\nRaised from Boardroom action ${action.id}; read_board_meeting shows how it stands.`;
}

function whatOf(carriedActions: CarriedAction[]): string {
	return carriedActions.map(({ action }) => action.what).join('; ');
}

/** What a raiser is told: the actions raised now, and any whose making failed, which a director raises by asking. */
export function actionsRaisedWords(raised: CarriedAction[], notRaised: CarriedAction[]): string {
	const raisedWords = raised.length === 0 ? '' : ` Raised from the carried decision: ${whatOf(raised)}.`;
	if (notRaised.length === 0) return raisedWords;
	const failed = whatOf(notRaised);
	return `${raisedWords} Not raised, because making it failed: ${failed}. A director raises them with raise_board_actions or on the meeting page.`;
}
