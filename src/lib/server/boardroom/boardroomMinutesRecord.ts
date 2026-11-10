import {
	allMinutesAnswers,
	minutesAnswers,
	type MeetingClosing,
	type MinutesAnswer,
	type MinutesFacts,
	type MinutesVersion
} from '$lib/data/boardroomMinutes';

export const boardMinutesTables = {
	closings: 'boardroom_meeting_closings',
	versions: 'boardroom_minutes',
	answers: 'boardroom_minutes_answers'
} as const;

export const meetingClosingColumns = 'meeting_id, closed_by_director_id, closed_at';

export const minutesVersionColumns = 'id, meeting_id, version, words, facts, written_by_director_id, written_at';

export const minutesAnswerColumns = 'minutes_id, director_id, answer, change_words, given_at';

export function parseMeetingClosingRecord(row: Record<string, unknown>): MeetingClosing {
	return {
		meetingId: row.meeting_id as string,
		closedByDirectorId: row.closed_by_director_id as string,
		closedAt: row.closed_at as string
	};
}

export function parseMinutesVersionRecord(row: Record<string, unknown>): MinutesVersion {
	return {
		id: row.id as string,
		meetingId: row.meeting_id as string,
		version: Number(row.version),
		words: String(row.words ?? ''),
		facts: row.facts as MinutesFacts,
		writtenByDirectorId: row.written_by_director_id as string,
		writtenAt: row.written_at as string
	};
}

export function parseMinutesAnswerRecord(row: Record<string, unknown>): MinutesAnswer {
	return {
		minutesId: row.minutes_id as string,
		directorId: row.director_id as string,
		answer: allMinutesAnswers.find((answer) => answer === row.answer) ?? minutesAnswers.asksForChange,
		changeWords: (row.change_words as string | null) ?? null,
		givenAt: row.given_at as string
	};
}
