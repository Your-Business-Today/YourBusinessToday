import { CashflowItemLimits, cashflowDirectionNames, cashflowRepeatNames } from '$lib/data/books/cashflow/cashflowItem';
import { textField } from '../actionTypes';

const { longestTitle, longestNotes } = CashflowItemLimits;

const keepWhatIsThere = '; leave out to keep what the item holds';

export const cashflowItemIdField = textField('The cashflow item, by its id as read_cashflow_forecast gives it');

/** Each setting of a forecast item as the person said it; on a change, each may be left out to keep what the item holds. */
function settingFields(suffix: string) {
	return {
		title: textField(`What the money is, at most ${longestTitle} characters, such as Repayment to Jeremy or Hosting${suffix}`),
		direction: textField(`Which way the money moves: ${cashflowDirectionNames.join(' for money in, ')} for money out${suffix}`),
		amount: { type: ['number', 'string'], description: `How much each time, in pounds, above zero, such as 400.76${suffix}` },
		repeats: textField(`How often it comes round: ${cashflowRepeatNames.join(', ')}${suffix}`),
		firstMonth: textField(`The first month it comes round, written as 2026-12${suffix}`),
		lastMonth: {
			type: ['string', 'null'],
			description: `The last month a repeating item can come round, written as 2031-11, or null while it carries on${suffix}`
		},
		notes: textField(`Any notes for the directors, at most ${longestNotes} characters, empty text for none${suffix}`)
	};
}

export const newCashflowItemFields = settingFields('');

export const cashflowItemChangeFields = { cashflowItemId: cashflowItemIdField, ...settingFields(keepWhatIsThere) };
