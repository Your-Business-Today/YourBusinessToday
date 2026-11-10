import { directorsOnMeeting, nameOfSeat, standingAgenda, type AgendaItem } from './boardroomMeeting';
import { emptyMeetingRoom, outcomeOfItem } from './boardroomRoom';
import { decisionOnItem, type DecisionOnItem } from './boardDecisionOnItem';
import { decisionRuleSentence } from './describeDecisionRule';
import { decisionStandingWords } from './describeBoardDecision';
import { minutedOutcomes, noMeetingMinutes, type MinutedDecision, type MinutedItem, type MinutedOutcome, type MinutesFacts } from './boardroomMinutes';
import type { BoardroomDirector } from './boardroomDirector';
import type { MeetingRecord } from './describeBoardroomMeeting';

function namesOf(directors: BoardroomDirector[], seatIds: string[]): string[] {
	return seatIds.map((seatId) => nameOfSeat(directors, seatId));
}

function minutedDecision(onItem: DecisionOnItem | null, directors: BoardroomDirector[]): MinutedDecision | null {
	if (onItem === null) return null;
	const { decision, result } = onItem;
	const answers = onItem.answers.map((given) => ({
		director: nameOfSeat(directors, given.directorId),
		answer: given.answer,
		reason: given.reason,
		answeredAt: given.answeredAt
	}));
	return {
		decisionId: decision.id,
		wording: decision.wording,
		rule: decisionRuleSentence(decision.rule),
		answers,
		gaveNoAnswer: namesOf(directors, onItem.gaveNoAnswer),
		isCarried: result.isCarried,
		result: decisionStandingWords(onItem, directors),
		replacesDecisionId: decision.replacesDecisionId
	};
}

function speakersOn(record: MeetingRecord, item: AgendaItem): string[] {
	const { contributions } = record.room ?? emptyMeetingRoom;
	const seatIds = contributions.filter((said) => said.agendaItemId === item.id).map((said) => said.directorId);
	return namesOf(record.directors, [...new Set(seatIds)]);
}

function minutedItem(record: MeetingRecord, item: AgendaItem, index: number, now: Date): MinutedItem {
	const outcome = outcomeOfItem(record.room ?? emptyMeetingRoom, item.id);
	const minuted: MinutedOutcome = outcome === null ? minutedOutcomes.notConcluded : outcome.outcome;
	return {
		number: index + 1,
		title: item.title,
		purpose: item.purpose,
		isAnyOtherBusiness: item.isAnyOtherBusiness,
		outcome: minuted,
		wording: outcome?.wording ?? null,
		speakers: speakersOn(record, item),
		decision: minutedDecision(decisionOnItem(record, item, now), record.directors)
	};
}

/**
 * The facts of a closed meeting, put in by the service from the record alone: who took part, each item and how it
 * came out, and each decision with every answer and its result as it stands now. Briefs, steer notes and pieces
 * held for a director are never part of it.
 */
export function minutesFactsOf(organisationName: string, record: MeetingRecord, now: Date): MinutesFacts {
	const { meeting, directors } = record;
	const { closing } = record.minutes ?? noMeetingMinutes;
	const agenda = standingAgenda(record.items);
	return {
		organisation: organisationName,
		meetsAt: meeting.meetsAt,
		openedAt: meeting.openedAt,
		closedAt: meeting.closedAt ?? now.toISOString(),
		chair: nameOfSeat(directors, meeting.chairDirectorId),
		closedBy: closing === null ? '' : nameOfSeat(directors, closing.closedByDirectorId),
		directorsPresent: directorsOnMeeting(directors, meeting, now).map((director) => director.name),
		items: agenda.map((item, index) => minutedItem(record, item, index, now)),
		withdrawn: record.items.filter((item) => item.withdrawnAt !== null).map((item) => item.title)
	};
}
