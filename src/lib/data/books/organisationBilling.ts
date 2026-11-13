import type { InvoiceStatus } from './invoiceStatuses';
import type { BillingScheduleSettings } from './billingSchedule';
import type { InvoiceLineInput } from './invoiceLineRules';

/** One line of a schedule as the Billing tab shows it, with what it comes to. */
export type BilledScheduleLine = InvoiceLineInput & { id: string; amount: number };

/** A schedule on the Billing tab: what it is set to, its lines, and the line that reads it at a glance. */
export type BilledSchedule = BillingScheduleSettings & { id: string; summary: string; lines: BilledScheduleLine[] };

/** One invoice raised to the organisation, as the Billing tab lists it, opening as its document. */
export type BilledOrganisationInvoice = {
	id: string;
	printedNumber: string;
	issueDate: string;
	reference: string;
	total: number;
	status: InvoiceStatus;
	isSent: boolean;
	documentHref: string;
};

/** A choice the schedule's form offers for a line: an income account or a cost centre. */
export type BillingChoice = { id: string; label: string };

/** Everything the Billing tab shows of what Your Business Today bills an organisation, and what its form offers. */
export type OrganisationBilling = {
	schedules: BilledSchedule[];
	invoices: BilledOrganisationInvoice[];
	incomeAccounts: BillingChoice[];
	costCentres: BillingChoice[];
	today: string;
};

/** How many schedules bill the organisation, for the Billing tab's count, or null where the tab is not shown. */
export function billingScheduleCountOf(billing: OrganisationBilling | null): number | null {
	if (billing === null) return null;
	const { schedules } = billing;
	return schedules.length;
}
