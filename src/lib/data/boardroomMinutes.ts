import type { AgendaPurpose } from './boardroomMeeting';
import type { DecisionAnswerKind } from './boardroomDecision';

/** How an item stood when the meeting closed: agreed or not agreed in the room, or never concluded there. */
export type MinutedOutcome = 'agreed' | 'not_agreed' | 'not_concluded';

export const minutedOutcomes = { agreed: 'agreed', notAgreed: 'not_agreed', notConcluded: 'not_concluded' } as const;

/** One director's answer to a decision, as the minutes keep it: named, not by seat. */
export type MinutedAnswer = { director: string; answer: DecisionAnswerKind; reason: string | null; answeredAt: string };

/** A decision as the minutes keep it: what was put, the rule, every answer, who gave none, and the result as it stood. */
export type MinutedDecision = {
	decisionId: string | null;
	wording: string;
	rule: string;
	answers: MinutedAnswer[];
	gaveNoAnswer: string[];
	isCarried: boolean;
	result: string;
	replacesDecisionId: string | null;
};

/** One item as the minutes keep it: its number, title and purpose, how it came out, and who spoke on it. */
export type MinutedItem = {
	number: number;
	title: string;
	purpose: AgendaPurpose;
	isAnyOtherBusiness: boolean;
	outcome: MinutedOutcome;
	wording: string | null;
	speakers: string[];
	decision: MinutedDecision | null;
};

/** The facts of a closed meeting the service puts in each version of its minutes, so a version stands on its own. */
export type MinutesFacts = {
	organisation: string;
	meetsAt: string;
	openedAt: string | null;
	closedAt: string;
	chair: string;
	closedBy: string;
	directorsPresent: string[];
	items: MinutedItem[];
	withdrawn: string[];
};

/** A meeting closed, once, by its minute-taker. */
export type MeetingClosing = { meetingId: string; closedByDirectorId: string; closedAt: string };

/** One numbered version of a closed meeting's minutes, kept as it was written. */
export type MinutesVersion = {
	id: string;
	meetingId: string;
	version: number;
	words: string;
	facts: MinutesFacts;
	writtenByDirectorId: string;
	writtenAt: string;
};

/** A director's own answer to one version of the minutes. */
export type MinutesAnswerKind = 'approves' | 'asks_for_change';

export const minutesAnswers = { approves: 'approves', asksForChange: 'asks_for_change' } as const;

export const allMinutesAnswers: MinutesAnswerKind[] = [minutesAnswers.approves, minutesAnswers.asksForChange];

export type MinutesAnswer = {
	minutesId: string;
	directorId: string;
	answer: MinutesAnswerKind;
	changeWords: string | null;
	givenAt: string;
};

/** A meeting's closing, every version of its minutes and every answer to them. */
export type MeetingMinutes = { closing: MeetingClosing | null; versions: MinutesVersion[]; answers: MinutesAnswer[] };

export const noMeetingMinutes: MeetingMinutes = { closing: null, versions: [], answers: [] };

/** The minutes' versions, earliest first. */
export function versionsInOrder(minutes: MeetingMinutes): MinutesVersion[] {
	return [...minutes.versions].sort((first, second) => first.version - second.version);
}

export function latestVersionOf(minutes: MeetingMinutes): MinutesVersion | null {
	return versionsInOrder(minutes).at(-1) ?? null;
}

/** Every answer given to one version, in the order they were given. */
export function answersToVersion(minutes: MeetingMinutes, minutesId: string): MinutesAnswer[] {
	const given = minutes.answers.filter((answer) => answer.minutesId === minutesId);
	return given.sort((first, second) => first.givenAt.localeCompare(second.givenAt));
}
