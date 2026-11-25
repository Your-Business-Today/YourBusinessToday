import { cashflowSettingRules, monthsRefusal } from './cashflowItemRules';
import type { CashflowItem, CashflowItemSettings } from './cashflowItem';

type SettingName = keyof CashflowItemSettings;

const settingNames = Object.keys(cashflowSettingRules) as SettingName[];

export const nothingToChange = `Give at least one of ${settingNames.join(', ')} to change; none was given.`;

/**
 * The item as it reads once the change is made, or the first reason the change cannot be kept: what is left out stays as
 * it is, a lastMonth of null lets a repeating item carry on, and the months are checked against each other once merged.
 */
export function applyCashflowItemChange(item: CashflowItem, fields: Record<string, unknown>): CashflowItem | string {
	const givenNames = settingNames.filter((name) => fields[name] !== undefined);
	if (givenNames.length === 0) return nothingToChange;
	const refusal = givenNames.map((name) => cashflowSettingRules[name](fields[name])).find((found) => found !== null);
	if (refusal !== undefined) return refusal;
	const changed = { ...item, ...Object.fromEntries(givenNames.map((name) => [name, fields[name]])) } as CashflowItem;
	const amountChanged = { ...changed, amount: Number(changed.amount) };
	return monthsRefusal(amountChanged) ?? amountChanged;
}
