import { allMinutesAnswers } from './boardroomMinutes';

/** The limits of boardroom_minutes and its answers (migration 0192), stated once for the service and the form. */
export const boardMinutesLimits = {
	longestWords: 20000,
	longestChangeWords: 4000,
	mostVersions: 100
} as const;

const { longestWords, longestChangeWords, mostVersions } = boardMinutesLimits;

export const boardMinutesRefusals = {
	confirmNotAnAnswer: 'closeWithItemsWaiting says whether the chair closes the meeting while an item has not come out of the room or a decision still waits for answers: true or false.',
	wordsMissing: `words is the minutes as your director's Claude wrote them from the record: required, at most ${longestWords} characters.`,
	versionNotANumber: 'version is the number of the latest version of the minutes, as read_board_meeting gives it: a whole number from 1.',
	answerUnknown: `answer is the director’s own answer to the minutes: one of ${allMinutesAnswers.join(', ')}.`,
	changeWordsMissing: `changeWords says what the director asks to change: required when asking for a change, at most ${longestChangeWords} characters.`,
	changeWordsWithApproval: 'changeWords is given only when the director asks for a change.',
	meetingNotOpen: 'Only an open board meeting is closed: this one has not opened yet, or has closed already.',
	notTheMinuteTaker: 'The chair closes the meeting and writes its minutes; when the chair no longer sits, a sitting director who was on it does.',
	meetingNotClosed: 'Minutes are written and answered once the meeting has closed. The chair closes it with close_board_meeting.',
	minutesApproved: 'The minutes are approved by every director on the meeting, so they are kept as they stand; no new version is written.',
	tooManyVersions: `A meeting's minutes run to at most ${mostVersions} versions.`,
	noMinutesYet: 'No minutes have been written for this meeting yet. The chair’s Claude writes them with write_board_minutes.',
	notTheLatestVersion: 'An answer belongs to the latest version of the minutes. Read the meeting again for its number, and the words it holds.',
	callerHasNoSeat: 'Only a sitting director who was on this meeting answers its minutes, each for themselves.',
	alreadyAnswered: 'You have answered this version of the minutes already. An answer is kept as it was given and is not changed.'
} as const;

export function isFittingMinutesWords(words: string): boolean {
	return words !== '' && words.length <= longestWords;
}

export function isFittingChangeWords(words: string): boolean {
	return words !== '' && words.length <= longestChangeWords;
}
