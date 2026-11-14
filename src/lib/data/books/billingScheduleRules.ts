import { validateRecordId } from '$lib/data/isUuid';
import { validateInvoiceLines } from './invoiceLineRules';
import { billingSettingNames, billingSettingRules } from './billingScheduleSettingRules';
import type { BillingScheduleChange, BillingScheduleSettings, NewBillingSchedule } from './billingSchedule';

const neededToStart: Record<string, string> = {
	customerId: 'customerId is needed: it is the customer the schedule bills.',
	title: 'title is needed: it names what the schedule bills, such as "Monthly fees".',
	frequency: 'frequency is needed: monthly, quarterly or yearly.',
	nextInvoiceDate: 'nextInvoiceDate is needed: the day the first invoice is raised, written as 2026-12-01.',
	covers: 'covers is needed: in_advance for the period starting on the invoice date, in_arrears for the one that ended the day before.',
	sendsByItself:
		'sendsByItself is needed, and never assumed: true issues and emails each invoice on its day by itself, ' +
		'false leaves each as a draft to issue by hand.',
	lines: 'lines is needed: every line each invoice carries, at least one.'
};

const leftOutOfANewSchedule = { paymentTermsDays: null, notes: '', isPaused: false, endsOn: null };

/** The new schedule as given, or the first reason it cannot be kept, on the day given: never trimmed or filled in. */
export function validateNewBillingSchedule(fields: Record<string, unknown>, today: string): NewBillingSchedule | string {
	const missing = Object.keys(neededToStart).find((name) => fields[name] === undefined);
	if (missing !== undefined) return neededToStart[missing];
	const refusal = validateRecordId('customer', String(fields.customerId)) ?? givenSettingRefusal(fields, today);
	if (refusal !== null) return refusal;
	const lines = validateInvoiceLines(fields.lines);
	if (typeof lines === 'string') return lines;
	const settings = { ...leftOutOfANewSchedule, ...givenSettings(fields) } as BillingScheduleSettings;
	const lastDateRefusal = endsBeforeItStartsRefusal(settings);
	if (lastDateRefusal !== null) return lastDateRefusal;
	return { ...settings, customerId: fields.customerId as string, lines };
}

/** The change as given, or the first reason it cannot be made; everything left out keeps what the schedule holds. */
export function validateBillingScheduleChange(fields: Record<string, unknown>, today: string): BillingScheduleChange | string {
	if (fields.customerId !== undefined) return 'A schedule keeps the customer it bills; end it and create one for the other customer.';
	const settings = givenSettings(fields);
	const isLinesGiven = fields.lines !== undefined;
	const isNothingGiven = Object.keys(settings).length === 0 && !isLinesGiven;
	if (isNothingGiven) return 'No change was given. Give at least one setting or the lines, and leave out the rest to keep them.';
	const refusal = givenSettingRefusal(fields, today);
	if (refusal !== null) return refusal;
	if (!isLinesGiven) return settings;
	const lines = validateInvoiceLines(fields.lines);
	if (typeof lines === 'string') return lines;
	return { ...settings, lines };
}

function givenSettings(fields: Record<string, unknown>): Partial<BillingScheduleSettings> {
	const given = billingSettingNames.filter((name) => fields[name] !== undefined);
	return Object.fromEntries(given.map((name) => [name, fields[name]]));
}

function givenSettingRefusal(fields: Record<string, unknown>, today: string): string | null {
	const given = billingSettingNames.filter((name) => fields[name] !== undefined);
	const refusals = given.map((name) => billingSettingRules[name](fields[name], today));
	return refusals.find((refusal) => refusal !== null) ?? null;
}

function endsBeforeItStartsRefusal(settings: BillingScheduleSettings): string | null {
	if (settings.endsOn === null || settings.endsOn >= settings.nextInvoiceDate) return null;
	return `endsOn ${settings.endsOn} is before nextInvoiceDate ${settings.nextInvoiceDate}, so the schedule would never raise an invoice.`;
}
