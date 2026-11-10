import { meetingStage, meetingStages, nameOfSeat, type AgendaItem } from './boardroomMeeting';
import { noSeatControls } from './boardroomSeatControls';
import { decisionOnItem, type DecisionOnItem } from './boardDecisionOnItem';
import { decisionStandingWords } from './describeBoardDecision';
import { decisionRuleSentence } from './describeDecisionRule';
import { ukMeetingTime } from './ukMeetingTime';
import type { DecisionAnswer, DecisionAnswerKind } from './boardroomDecision';
import type { BoardroomDirector } from './boardroomDirector';
import type { MeetingRecord } from './describeBoardroomMeeting';

/** One director's own answer, as every director reads it on the meeting's page. */
export type DecisionAnswerView = { directorName: string; answer: DecisionAnswerKind; reason: string | null; when: string };

/** Where a decision stands, as its badge shows it. */
export type DecisionStanding = 'waiting' | 'carried' | 'not_carried';

export const decisionStandings = { waiting: 'waiting', carried: 'carried', notCarried: 'not_carried' } as const;

/** The decision on an item as the meeting's page shows it, and whether the reader still has their own answer to give. */
export type ItemDecisionView = {
	wording: string;
	ruleWords: string;
	replacesDecisionId: string | null;
	answers: DecisionAnswerView[];
	standing: DecisionStanding;
	standingWords: string;
	canAnswer: boolean;
};

function answerView(answer: DecisionAnswer, directors: BoardroomDirector[]): DecisionAnswerView {
	const directorName = nameOfSeat(directors, answer.directorId);
	return { directorName, answer: answer.answer, reason: answer.reason, when: ukMeetingTime(answer.answeredAt) };
}

function standingOf(onItem: DecisionOnItem): DecisionStanding {
	const { result } = onItem;
	if (!result.isDecided) return decisionStandings.waiting;
	return result.isCarried ? decisionStandings.carried : decisionStandings.notCarried;
}

function canReaderAnswer(record: MeetingRecord, onItem: DecisionOnItem, now: Date): boolean {
	const { seatId } = record.controls ?? noSeatControls;
	const isOpen = meetingStage(record.meeting, now) === meetingStages.open;
	return isOpen && seatId !== null && onItem.waitingFor.includes(seatId);
}

/** The decision on one item for the meeting's page, or null when nothing is put to the directors on it. */
export function itemDecisionViewOf(record: MeetingRecord, item: AgendaItem, now: Date): ItemDecisionView | null {
	const onItem = decisionOnItem(record, item, now);
	if (onItem === null) return null;
	const { decision } = onItem;
	const { directors } = record;
	return {
		wording: decision.wording,
		ruleWords: decisionRuleSentence(decision.rule),
		replacesDecisionId: decision.replacesDecisionId,
		answers: onItem.answers.map((answer) => answerView(answer, directors)),
		standing: standingOf(onItem),
		standingWords: decisionStandingWords(onItem, directors),
		canAnswer: canReaderAnswer(record, onItem, now)
	};
}
