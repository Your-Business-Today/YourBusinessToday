import { boardroomMeetingRefusals } from './boardroomMeetingRules';
import {
	isRecord,
	readAgendaPurpose,
	validateAgendaTitle,
	validateAgendaItemDrafts,
	type AgendaItemDraft
} from './validateAgendaItem';
import type { AgendaPurpose } from './boardroomMeeting';

/** An item to reword, by its number on the agenda as read now: a new title, a new purpose, or both. */
export type AgendaRewording = {
	number: number;
	title: string | null;
	purpose: AgendaPurpose | null;
};

export type AgendaChange = {
	add: AgendaItemDraft[];
	reword: AgendaRewording[];
	withdraw: number[];
};

function readItemNumber(value: unknown): number | null {
	const isItemNumber = typeof value === 'number' && Number.isInteger(value) && value >= 1;
	return isItemNumber ? value : null;
}

function validateRewording(value: unknown): AgendaRewording | string {
	if (!isRecord(value)) return boardroomMeetingRefusals.rewordNotAnObject;
	const number = readItemNumber(value.number);
	if (number === null) return boardroomMeetingRefusals.numberNotOnAgenda;
	const title = value.title === undefined ? null : validateAgendaTitle(value.title);
	if (title !== null && typeof title !== 'string') return title.refusal;
	const purpose = value.purpose === undefined ? null : readAgendaPurpose(value.purpose);
	if (value.purpose !== undefined && purpose === null) return boardroomMeetingRefusals.purposeUnknown;
	if (title === null && purpose === null) return boardroomMeetingRefusals.rewordNotAnObject;
	return { number, title, purpose };
}

function validateRewordings(value: unknown): AgendaRewording[] | string {
	if (value === undefined) return [];
	if (!Array.isArray(value)) return boardroomMeetingRefusals.rewordNotAnObject;
	const rewordings: AgendaRewording[] = [];
	for (const item of value) {
		const rewording = validateRewording(item);
		if (typeof rewording === 'string') return rewording;
		rewordings.push(rewording);
	}
	return rewordings;
}

function validateWithdrawals(value: unknown): number[] | string {
	if (value === undefined) return [];
	if (!Array.isArray(value)) return boardroomMeetingRefusals.withdrawNotNumbers;
	const numbers = value.map(readItemNumber);
	if (numbers.some((number) => number === null)) return boardroomMeetingRefusals.withdrawNotNumbers;
	return numbers as number[];
}

/** The numbers of the standing items a change rewords or withdraws, in that order. */
export function revisedNumbers({ reword, withdraw }: AgendaChange): number[] {
	return [...reword.map((rewording) => rewording.number), ...withdraw];
}

function namesAnItemTwice(change: AgendaChange): boolean {
	const numbers = revisedNumbers(change);
	return new Set(numbers).size !== numbers.length;
}

/** The change as given, every value checked against its column, or the sentence naming the one that does not fit. */
export function validateAgendaChange(input: Record<string, unknown>): AgendaChange | string {
	const add = input.add === undefined ? [] : validateAgendaItemDrafts(input.add);
	if (typeof add === 'string') return add;
	const reword = validateRewordings(input.reword);
	if (typeof reword === 'string') return reword;
	const withdraw = validateWithdrawals(input.withdraw);
	if (typeof withdraw === 'string') return withdraw;
	const change = { add, reword, withdraw };
	if (add.length + reword.length + withdraw.length === 0) return boardroomMeetingRefusals.nothingToChange;
	if (namesAnItemTwice(change)) return boardroomMeetingRefusals.numberTwice;
	return change;
}
