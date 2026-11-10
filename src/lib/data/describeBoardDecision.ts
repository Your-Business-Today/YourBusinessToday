import { ukMeetingTime } from './ukMeetingTime';
import { nameOfSeat } from './boardroomMeeting';
import { decisionResultSentence, decisionRuleSentence } from './describeDecisionRule';
import type { BoardroomDirector } from './boardroomDirector';
import type { DecisionAnswer } from './boardroomDecision';
import type { DecisionOnItem } from './boardDecisionOnItem';

const agendaIndent = '   ';

function namesOf(directors: BoardroomDirector[], seatIds: string[]): string {
	return seatIds.map((seatId) => nameOfSeat(directors, seatId)).join(', ');
}

/** One director's answer, with when they gave it and their reason if they gave one. */
export function answerLine(answer: DecisionAnswer, directors: BoardroomDirector[]): string {
	const reason = answer.reason === null ? '' : `: ${answer.reason}`;
	return `- ${nameOfSeat(directors, answer.directorId)} ${answer.answer}, ${ukMeetingTime(answer.answeredAt)}${reason}`;
}

function idWords(onItem: DecisionOnItem): string {
	const { decision } = onItem;
	if (decision.id === null) return 'no director has answered yet';
	return `decision ${decision.id}`;
}

function replacesLines(onItem: DecisionOnItem): string[] {
	const { decision } = onItem;
	if (decision.replacesDecisionId === null) return [];
	return [`It replaces the earlier decision ${decision.replacesDecisionId}, if it carries.`];
}

/** Where a decision stands: its result, or who is still to answer it. */
export function decisionStandingWords(onItem: DecisionOnItem, directors: BoardroomDirector[]): string {
	const { waitingFor } = onItem;
	const result = decisionResultSentence(onItem.result);
	if (waitingFor.length === 0) return result;
	return `${result} Still to answer: ${namesOf(directors, waitingFor)}.`;
}

function answersLines(onItem: DecisionOnItem, directors: BoardroomDirector[]): string[] {
	const { answers } = onItem;
	if (answers.length === 0) return ['Answers: none yet.'];
	return ['Answers, in the order the directors gave them:', ...answers.map((answer) => answerLine(answer, directors))];
}

/** On read_board_item: the decision put to the directors, the rule it is decided by, every answer and the result. */
export function decisionLines(onItem: DecisionOnItem | null, directors: BoardroomDirector[]): string[] {
	if (onItem === null) return [];
	const { decision } = onItem;
	const put = `Decision put to the directors (${idWords(onItem)}): "${decision.wording}"`;
	const rule = `How it carries: ${decisionRuleSentence(decision.rule)}`;
	const result = `Result: ${decisionStandingWords(onItem, directors)}`;
	return ['', put, ...replacesLines(onItem), rule, ...answersLines(onItem, directors), result];
}

/** Beneath an item on read_board_meeting: the decision on it and where it stands, in one line. */
export function decisionLineOnAgenda(onItem: DecisionOnItem | null, directors: BoardroomDirector[]): string[] {
	if (onItem === null) return [];
	return [`${agendaIndent}- Decision (${idWords(onItem)}): ${decisionStandingWords(onItem, directors)}`];
}

/** The answer when a director's own answer is kept: what they answered, and where the decision stands now. */
export function decisionAnswerKeptWords(itemNumber: number, onItem: DecisionOnItem | null, directors: BoardroomDirector[]): string {
	const kept = `Your answer to the decision on item ${itemNumber} is kept as you gave it, with when you gave it; it is not changed.`;
	if (onItem === null) return kept;
	return `${kept} ${decisionStandingWords(onItem, directors)}`;
}
