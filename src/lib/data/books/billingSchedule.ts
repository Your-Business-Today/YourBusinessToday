import { booksSettingsRanges } from './booksSettingsRules';
import type { InvoiceLineInput } from './invoiceLineRules';

/** How often a billing schedule raises an invoice, as books_billing_schedules.frequency holds it (migration 0221). */
export const BillingFrequencies = { monthly: 'monthly', quarterly: 'quarterly', yearly: 'yearly' } as const;

export type BillingFrequency = (typeof BillingFrequencies)[keyof typeof BillingFrequencies];

export const billingFrequencyNames = Object.values(BillingFrequencies);

/** The months one invoice of each frequency covers. */
export const monthsInBillingPeriod: Record<BillingFrequency, number> = { monthly: 1, quarterly: 3, yearly: 12 };

/** Whether an invoice covers the period that starts on its date or the one that ended the day before. */
export const BillingCovers = { inAdvance: 'in_advance', inArrears: 'in_arrears' } as const;

export type BillingCover = (typeof BillingCovers)[keyof typeof BillingCovers];

export const billingCoverNames = Object.values(BillingCovers);

/** The limits books_billing_schedules holds a schedule to, stated once for the service and any form. */
export const billingScheduleLimits = {
	longestTitle: 120,
	latestDayOfMonth: 28,
	paymentTermsDays: booksSettingsRanges.paymentTermsDays
} as const;

/** What a schedule is set to: everything but its customer and its lines. */
export type BillingScheduleSettings = {
	title: string;
	frequency: BillingFrequency;
	nextInvoiceDate: string;
	covers: BillingCover;
	paymentTermsDays: number | null;
	sendsByItself: boolean;
	notes: string;
	isPaused: boolean;
	endsOn: string | null;
};

/** A new schedule: the customer it bills, its settings and its lines. */
export type NewBillingSchedule = BillingScheduleSettings & { customerId: string; lines: InvoiceLineInput[] };

/** What a person asked to change of a schedule; lines, when given, are every line it is to hold. */
export type BillingScheduleChange = Partial<BillingScheduleSettings> & { lines?: InvoiceLineInput[] };
