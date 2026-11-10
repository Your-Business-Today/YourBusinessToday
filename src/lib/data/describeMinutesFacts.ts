import { ukMeetingTime } from './ukMeetingTime';
import { agendaPurposeWords } from './describeBoardroomMeeting';
import { minutedActionLines } from './minutedActions';
import { minutedOutcomes, type MinutedAnswer, type MinutedDecision, type MinutedItem, type MinutesFacts } from './boardroomMinutes';

const indent = '   ';
const anyOtherBusinessWords = ' (any other business)';

function outcomeLine(item: MinutedItem): string {
	if (item.outcome === minutedOutcomes.agreed) return `${indent}Came out of the room agreed: "${item.wording}"`;
	if (item.outcome === minutedOutcomes.notAgreed) return `${indent}Came out of the room not agreed.`;
	return `${indent}Not concluded: it had not come out of the room when the meeting closed.`;
}

function speakersLine({ speakers }: MinutedItem): string {
	if (speakers.length === 0) return `${indent}No director's Claude spoke on it.`;
	return `${indent}Spoke on it: ${speakers.join(', ')}.`;
}

function answerLine(answer: MinutedAnswer): string {
	const reason = answer.reason === null ? '' : `: ${answer.reason}`;
	return `${indent}- ${answer.director} ${answer.answer}, ${ukMeetingTime(answer.answeredAt)}${reason}`;
}

function decisionLines(decision: MinutedDecision | null): string[] {
	if (decision === null) return [];
	const id = decision.decisionId === null ? 'no director answered it' : `decision ${decision.decisionId}`;
	const replaces = decision.replacesDecisionId === null ? [] : [`${indent}It replaces the earlier decision ${decision.replacesDecisionId}.`];
	const given = decision.answers;
	const answers = given.length === 0 ? [`${indent}No director answered it.`] : given.map(answerLine);
	const put = `${indent}Decision put to the directors (${id}): "${decision.wording}"`;
	return [put, ...replaces, `${indent}${decision.rule}`, ...answers, `${indent}Result: ${decision.result}`];
}

function itemLines(item: MinutedItem): string[] {
	const aside = item.isAnyOtherBusiness ? anyOtherBusinessWords : '';
	const heading = `${item.number}. ${item.title} — ${agendaPurposeWords[item.purpose]}${aside}`;
	return [heading, speakersLine(item), outcomeLine(item), ...decisionLines(item.decision), ...minutedActionLines(item.actions)];
}

function openedWords(facts: MinutesFacts): string {
	if (facts.openedAt === null) return 'Opened at its time';
	return `Opened ${ukMeetingTime(facts.openedAt)}`;
}

function withdrawnLines({ withdrawn }: MinutesFacts): string[] {
	if (withdrawn.length === 0) return [];
	return ['', 'Withdrawn before the meeting:', ...withdrawn.map((title) => `- ${title}`)];
}

/** The facts of a version of the minutes, as the service put them in: the same words on the page and the connector. */
export function minutesFactsLines(facts: MinutesFacts): string[] {
	const heading = `Minutes of the board meeting of ${facts.organisation}, ${ukMeetingTime(facts.meetsAt)} (UK time).`;
	const timing = `${openedWords(facts)}; closed ${ukMeetingTime(facts.closedAt)} by ${facts.closedBy}. Chair: ${facts.chair}.`;
	const present = `Directors present: ${facts.directorsPresent.join(', ')}.`;
	const items = facts.items.flatMap(itemLines);
	return [heading, timing, present, '', 'The agenda, as it came out:', ...items, ...withdrawnLines(facts)];
}
