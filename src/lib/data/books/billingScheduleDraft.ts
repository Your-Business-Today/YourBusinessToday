import { invoiceLineTotal } from './customerBalance';
import { sumMoney } from './money';
import { monthOfDay, shiftMonth } from './monthKey';
import { BillingCovers, BillingFrequencies, type BillingCover, type BillingFrequency } from './billingSchedule';
import type { ScheduleToSummarise } from './billingScheduleSummary';

/** One line of a schedule as the form holds it while a person types: every figure as it was typed. */
export type BillingLineDraft = { description: string; quantity: string; unitPrice: string; incomeAccountId: string; costCentreId: string };

/** A schedule as the form holds it: its settings and lines as typed, an empty box meaning none. */
export type BillingScheduleDraft = {
	title: string;
	frequency: BillingFrequency;
	nextInvoiceDate: string;
	covers: BillingCover;
	paymentTermsDays: string;
	sendsByItself: boolean;
	notes: string;
	endsOn: string;
	lines: BillingLineDraft[];
};

const leftEmpty = '';

const firstOfTheMonth = '01';

const nextMonth = 1;

/** A new line, posting to the income account the books offer first. */
export function blankLineDraft(incomeAccountId: string): BillingLineDraft {
	return { description: leftEmpty, quantity: '1', unitPrice: leftEmpty, incomeAccountId, costCentreId: leftEmpty };
}

/** A new schedule: monthly in advance from the first of next month, with one line, and sending left for the person to tick. */
export function blankScheduleDraft(today: string, incomeAccountId: string): BillingScheduleDraft {
	return {
		title: 'Monthly fees',
		frequency: BillingFrequencies.monthly,
		nextInvoiceDate: `${shiftMonth(monthOfDay(today), nextMonth)}-${firstOfTheMonth}`,
		covers: BillingCovers.inAdvance,
		paymentTermsDays: leftEmpty,
		sendsByItself: false,
		notes: leftEmpty,
		endsOn: leftEmpty,
		lines: [blankLineDraft(incomeAccountId)]
	};
}

/** A schedule the books hold, as the form shows it to be changed. */
export function draftOfSchedule(schedule: ScheduleToSummarise): BillingScheduleDraft {
	const { title, frequency, nextInvoiceDate, covers, sendsByItself, notes } = schedule;
	return {
		title,
		frequency,
		nextInvoiceDate,
		covers,
		sendsByItself,
		notes,
		paymentTermsDays: schedule.paymentTermsDays === null ? leftEmpty : String(schedule.paymentTermsDays),
		endsOn: schedule.endsOn ?? leftEmpty,
		lines: schedule.lines.map((line) => ({
			description: line.description,
			quantity: String(line.quantity),
			unitPrice: String(line.unitPrice),
			incomeAccountId: line.incomeAccountId,
			costCentreId: line.costCentreId ?? leftEmpty
		}))
	};
}

/** What the lines come to as typed, or null while a figure is not yet a number. */
export function draftTotal(draft: BillingScheduleDraft): number | null {
	const amounts = draft.lines.map((line) => invoiceLineTotal(Number(line.quantity), Number(line.unitPrice)));
	const isEveryFigureTyped = draft.lines.every((line) => line.quantity !== leftEmpty && line.unitPrice !== leftEmpty);
	const isEveryAmountANumber = amounts.every((amount) => Number.isFinite(amount));
	if (!isEveryFigureTyped || !isEveryAmountANumber) return null;
	return sumMoney(amounts);
}

/**
 * The settings and lines as create_billing_schedule and update_billing_schedule take them. An empty box is none, and
 * every figure goes as it was typed, for the service to refuse by name when its column cannot hold it.
 */
export function fieldsOfDraft(draft: BillingScheduleDraft): Record<string, unknown> {
	const { paymentTermsDays, endsOn, lines, ...settings } = draft;
	return {
		...settings,
		paymentTermsDays: paymentTermsDays === leftEmpty ? null : Number(paymentTermsDays),
		endsOn: endsOn === leftEmpty ? null : endsOn,
		lines: lines.map((line) => ({ ...line, costCentreId: line.costCentreId === leftEmpty ? null : line.costCentreId }))
	};
}
