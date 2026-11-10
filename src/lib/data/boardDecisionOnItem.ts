import { directorsOnMeeting, isStanding, type AgendaItem } from './boardroomMeeting';
import { isSitting } from './boardroomDirector';
import { emptyMeetingRoom, outcomeKinds, outcomeOfItem, type BoardContribution } from './boardroomRoom';
import { answersTo, decisionOfItem, noMeetingDecisions, type BoardDecision, type DecisionAnswer } from './boardroomDecision';
import { decisionResultOf, type DecisionResult } from './boardDecisionResult';
import type { MeetingRecord } from './describeBoardroomMeeting';

const decisionPurpose = 'decision';

/** A decision as it is put to the directors: as kept once the first of them answers, and with no id before. */
export type PutDecision = Omit<BoardDecision, 'id' | 'openedAt'> & { id: string | null };

/** A decision on one item: what is put, every answer so far, who is still to answer, and how it stands. */
export type DecisionOnItem = {
	decision: PutDecision;
	answers: DecisionAnswer[];
	waitingFor: string[];
	result: DecisionResult;
};

function proposalOf(record: MeetingRecord, proposalId: string | null): BoardContribution | null {
	const { contributions } = record.room ?? emptyMeetingRoom;
	return contributions.find((contribution) => contribution.id === proposalId) ?? null;
}

/** The decision an item's agreed outcome puts, before any director has answered it. */
function decisionToPut(record: MeetingRecord, item: AgendaItem): PutDecision | null {
	const outcome = outcomeOfItem(record.room ?? emptyMeetingRoom, item.id);
	if (outcome?.outcome !== outcomeKinds.agreed || outcome.wording === null) return null;
	const proposal = proposalOf(record, outcome.proposalId);
	if (proposal === null) return null;
	const { ruleInForce } = record.decisions ?? noMeetingDecisions;
	const { meeting } = record;
	const base = { agendaItemId: item.id, meetingId: meeting.id, proposalId: proposal.id, wording: outcome.wording };
	const rule = { rule: ruleInForce, chairDirectorId: meeting.chairDirectorId };
	return { id: null, ...base, ...rule, replacesDecisionId: proposal.replacesDecisionId };
}

/** The directors who were on the meeting and still sit: only they answer, so one who has stood down holds up nobody. */
export function answeringSeatsOf(record: MeetingRecord, now: Date): string[] {
	const onIt = directorsOnMeeting(record.directors, record.meeting, now).filter(isSitting);
	return onIt.map((director) => director.id);
}

/** The decision on an item for decision that came out of the room agreed, and how it stands; null on any other item. */
export function decisionOnItem(record: MeetingRecord, item: AgendaItem, now: Date): DecisionOnItem | null {
	if (item.purpose !== decisionPurpose || !isStanding(item)) return null;
	const meetingDecisions = record.decisions ?? noMeetingDecisions;
	const kept = decisionOfItem(meetingDecisions, item.id);
	const decision = kept ?? decisionToPut(record, item);
	if (decision === null) return null;
	const answers = decision.id === null ? [] : answersTo(meetingDecisions, decision.id);
	const hasAnswered = (seatId: string) => answers.some((answer) => answer.directorId === seatId);
	const waitingFor = answeringSeatsOf(record, now).filter((seatId) => !hasAnswered(seatId));
	const directorCount = directorsOnMeeting(record.directors, record.meeting, now).length;
	const count = { rule: decision.rule, chairDirectorId: decision.chairDirectorId, answers, waitingFor, directorsOnMeeting: directorCount };
	return { decision, answers, waitingFor, result: decisionResultOf(count) };
}
