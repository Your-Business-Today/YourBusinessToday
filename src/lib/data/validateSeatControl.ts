import { isFittingSteerNote, seatControlRefusals } from './boardroomSeatControlRules';
import { allSeatSettings, type SeatSetting } from './boardroomSeatControls';
import { isUuid } from './isUuid';

/** A change to one setting of a director's own Claude, as given. */
export type SettingDraft = { setting: SeatSetting; isOn: boolean };

/** A director's answer to a piece their Claude holds for them, as given. */
export type HeldAnswerDraft = { heldId: string; isYes: boolean };

/** The two answers a director gives a held piece, as the form sends them. */
export const yesOrNo = { yes: 'yes', no: 'no' } as const;
const trueOrFalse = { true: 'true', false: 'false' } as const;

function textOf(value: unknown): string {
	return String(value ?? '').trim();
}

/** A steer note as given: its words, or the sentence naming what does not fit. */
export function validateSteerNote(input: Record<string, unknown>): { words: string } | string {
	const words = textOf(input.words);
	if (!isFittingSteerNote(words)) return seatControlRefusals.steerNoteMissing;
	return { words };
}

function readIsOn(value: unknown): boolean | null {
	if (value === true || value === trueOrFalse.true) return true;
	if (value === false || value === trueOrFalse.false) return false;
	return null;
}

export function validateSeatSetting(input: Record<string, unknown>): SettingDraft | string {
	const setting = allSeatSettings.find((known) => known === input.setting);
	if (setting === undefined) return seatControlRefusals.settingUnknown;
	const isOn = readIsOn(input.isOn);
	if (isOn === null) return seatControlRefusals.isOnNotAnAnswer;
	return { setting, isOn };
}

export function validateHeldAnswer(input: Record<string, unknown>): HeldAnswerDraft | string {
	const heldId = textOf(input.heldId);
	if (!isUuid(heldId)) return seatControlRefusals.heldIdNotAnId;
	const answer = textOf(input.answer);
	if (answer !== yesOrNo.yes && answer !== yesOrNo.no) return seatControlRefusals.answerUnknown;
	return { heldId, isYes: answer === yesOrNo.yes };
}
