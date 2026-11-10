import type { ContributionStance } from './boardroomRoom';

/** The two things a director switches on and off for their own Claude on one meeting. */
export type SeatSetting = 'paused' | 'ask_me_first';

export const seatSettings = { paused: 'paused', askMeFirst: 'ask_me_first' } as const;

export const allSeatSettings: SeatSetting[] = [seatSettings.paused, seatSettings.askMeFirst];

/** A note a director writes to their own Claude, which it reads before its next turn. */
export type SteerNote = { id: string; words: string; writtenAt: string };

/** One change a director made to a setting of their own Claude, kept as it happened. */
export type SeatSettingChange = { id: string; setting: SeatSetting; isOn: boolean; changedAt: string };

export type HeldAnswerKind = 'said' | 'kept_unsaid';

export const heldAnswers = { said: 'said', keptUnsaid: 'kept_unsaid' } as const;

/** What a Claude whose director asked to be asked first is about to say, and the director's answer once given. */
export type HeldContribution = {
	id: string;
	agendaItemId: string;
	stance: ContributionStance;
	words: string;
	wording: string | null;
	onProposalId: string | null;
	correctsId: string | null;
	replacesDecisionId: string | null;
	heldAt: string;
	answer: HeldAnswerKind | null;
};

/** Everything one director has told their own Claude on one meeting. Nobody else ever reads it. */
export type SeatControls = {
	seatId: string | null;
	steerNotes: SteerNote[];
	settingChanges: SeatSettingChange[];
	held: HeldContribution[];
};

export const noSeatControls: SeatControls = { seatId: null, steerNotes: [], settingChanges: [], held: [] };

function byTimeOf<Row>(timeOf: (row: Row) => string) {
	return (first: Row, second: Row) => timeOf(first).localeCompare(timeOf(second));
}

/** Whether a setting is on: the latest change of it says so, and it is off until a director first turns it on. */
export function isSettingOn(controls: SeatControls, setting: SeatSetting): boolean {
	const changes = controls.settingChanges.filter((change) => change.setting === setting);
	const latest = changes.sort(byTimeOf((change) => change.changedAt)).at(-1);
	return latest?.isOn ?? false;
}

export function isPaused(controls: SeatControls): boolean {
	return isSettingOn(controls, seatSettings.paused);
}

export function isAskingFirst(controls: SeatControls): boolean {
	return isSettingOn(controls, seatSettings.askMeFirst);
}

/** Every steer note, the latest first. */
export function steerNotesLatestFirst(controls: SeatControls): SteerNote[] {
	return [...controls.steerNotes].sort(byTimeOf((note: SteerNote) => note.writtenAt)).reverse();
}

export function latestSteerNote(controls: SeatControls): SteerNote | null {
	return steerNotesLatestFirst(controls)[0] ?? null;
}

/** The pieces still waiting for the director's answer, the oldest first. */
export function heldAwaitingAnswer(controls: SeatControls): HeldContribution[] {
	const waiting = controls.held.filter((held) => held.answer === null);
	return waiting.sort(byTimeOf((held) => held.heldAt));
}

export function heldAwaitingOnItem(controls: SeatControls, agendaItemId: string): HeldContribution | null {
	return heldAwaitingAnswer(controls).find((held) => held.agendaItemId === agendaItemId) ?? null;
}
