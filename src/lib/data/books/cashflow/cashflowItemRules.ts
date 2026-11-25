import { plainTextRefusal } from '../chartRules';
import { validateMoney } from '../moneyColumn';
import { validateMonthKey } from '../monthKey';
import { lengthRefusal } from '../textColumn';
import {
	CashflowItemLimits,
	CashflowRepeats,
	cashflowDirectionNames,
	cashflowRepeatNames,
	type CashflowDirection,
	type CashflowItemSettings,
	type CashflowRepeat
} from './cashflowItem';

type FieldRule = (candidate: unknown) => string | null;

const nothing = 0;

/** Each setting's own check against its column, the same for a new item and a change to one. */
export const cashflowSettingRules: Record<keyof CashflowItemSettings, FieldRule> = {
	title: titleRefusal,
	direction: (candidate) => choiceRefusal('direction', candidate, cashflowDirectionNames),
	amount: amountRefusal,
	repeats: (candidate) => choiceRefusal('repeats', candidate, cashflowRepeatNames),
	firstMonth: (candidate) => validateMonthKey('firstMonth', candidate),
	lastMonth: (candidate) => (candidate === null ? null : validateMonthKey('lastMonth', candidate)),
	notes: notesRefusal
};

export const requiredCashflowSettings: (keyof CashflowItemSettings)[] = ['title', 'direction', 'amount', 'repeats', 'firstMonth'];

/** The item as given, or the first reason it cannot be kept: never trimmed, rounded or filled in beyond no last month and no notes. */
export function validateCashflowItem(fields: Record<string, unknown>): CashflowItemSettings | string {
	const missing = requiredCashflowSettings.find((name) => fields[name] === undefined);
	if (missing !== undefined) return `${missing} is needed; it was left out.`;
	const settings = { ...fields, lastMonth: fields.lastMonth ?? null, notes: fields.notes ?? '' } as Record<keyof CashflowItemSettings, unknown>;
	const names = Object.keys(cashflowSettingRules) as (keyof CashflowItemSettings)[];
	const refusal = names.map((name) => cashflowSettingRules[name](settings[name])).find((found) => found !== null);
	if (refusal !== undefined) return refusal;
	return monthsRefusal(settings as CashflowItemSettings) ?? pickSettings(settings as CashflowItemSettings);
}

/** Why the item's months do not agree with how often it comes round, or null when they do. */
export function monthsRefusal(settings: CashflowItemSettings): string | null {
	if (settings.lastMonth === null) return null;
	if (settings.repeats === CashflowRepeats.once) return 'lastMonth is only for an item that repeats; leave it out for one that comes once.';
	if (settings.lastMonth >= settings.firstMonth) return null;
	return `lastMonth cannot come before firstMonth; ${settings.lastMonth} is before ${settings.firstMonth}.`;
}

function pickSettings(settings: CashflowItemSettings): CashflowItemSettings {
	const { title, direction, amount, repeats, firstMonth, lastMonth, notes } = settings;
	return { title, direction: direction as CashflowDirection, amount: Number(amount), repeats: repeats as CashflowRepeat, firstMonth, lastMonth, notes };
}

function titleRefusal(candidate: unknown): string | null {
	return plainTextRefusal('title', candidate) ?? lengthRefusal('title', candidate as string, CashflowItemLimits.longestTitle);
}

function notesRefusal(candidate: unknown): string | null {
	if (typeof candidate !== 'string') return `notes is text; ${JSON.stringify(candidate)} was given.`;
	return lengthRefusal('notes', candidate, CashflowItemLimits.longestNotes);
}

function amountRefusal(candidate: unknown): string | null {
	const amount = validateMoney('amount', candidate);
	if (typeof amount === 'string') return amount;
	if (amount > nothing) return null;
	return `amount is above zero; ${candidate} was given. Say which way the money moves with direction.`;
}

function choiceRefusal(field: string, candidate: unknown, choices: readonly string[]): string | null {
	if (choices.includes(candidate as string)) return null;
	return `${field} is one of ${choices.join(', ')}; ${JSON.stringify(candidate)} was given.`;
}
