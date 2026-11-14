import type { BillingCover, BillingFrequency, BillingScheduleSettings } from '$lib/data/books/billingSchedule';
import type { InvoiceLineInput } from '$lib/data/books/invoiceLineRules';
import type { InvoiceLine, InvoiceLineRow } from './invoiceRecord';

/** A schedule as the organisation's books hold it: its customer, its settings and its lines in the order they print. */
export type BillingSchedule = BillingScheduleSettings & { id: string; customerId: string; lines: InvoiceLine[] };

export type BillingScheduleRow = {
	id: string;
	customer_id: string;
	title: string;
	frequency: BillingFrequency;
	next_invoice_date: string;
	covers: BillingCover;
	payment_terms_days: number | null;
	sends_by_itself: boolean;
	notes: string;
	is_paused: boolean;
	ends_on: string | null;
};

export type BillingScheduleLineRow = InvoiceLineRow & { schedule_id: string };

export const billingSchedulesTable = 'books_billing_schedules';

export const billingScheduleLinesTable = 'books_billing_schedule_lines';

export const billingScheduleColumns =
	'id, customer_id, title, frequency, next_invoice_date, covers, payment_terms_days, sends_by_itself, notes, is_paused, ends_on';

export const billingScheduleLineColumns = 'id, schedule_id, description, quantity, unit_price, income_account_id, cost_centre_id';

/** Each setting's column in books_billing_schedules (migration 0221), stated once for reading and writing. */
const settingColumns: Record<keyof BillingScheduleSettings, keyof BillingScheduleRow> = {
	title: 'title',
	frequency: 'frequency',
	nextInvoiceDate: 'next_invoice_date',
	covers: 'covers',
	paymentTermsDays: 'payment_terms_days',
	sendsByItself: 'sends_by_itself',
	notes: 'notes',
	isPaused: 'is_paused',
	endsOn: 'ends_on'
};

/** The columns of the settings given, and none of the ones left out. */
export function toSettingColumns(settings: Partial<BillingScheduleSettings>): Record<string, unknown> {
	const given = Object.entries(settings).filter(([name, value]) => name in settingColumns && value !== undefined);
	return Object.fromEntries(given.map(([name, value]) => [settingColumns[name as keyof BillingScheduleSettings], value]));
}

export function fromBillingScheduleRow(row: BillingScheduleRow, lines: InvoiceLine[]): BillingSchedule {
	const settings = Object.fromEntries(Object.entries(settingColumns).map(([name, column]) => [name, row[column]]));
	return { ...(settings as BillingScheduleSettings), id: row.id, customerId: row.customer_id, lines };
}

/** A line as the database step and the lines table take it, in its place on the schedule. */
export function toScheduleLineRow(line: InvoiceLineInput) {
	return {
		description: line.description,
		quantity: line.quantity,
		unit_price: line.unitPrice,
		income_account_id: line.incomeAccountId,
		cost_centre_id: line.costCentreId
	};
}
