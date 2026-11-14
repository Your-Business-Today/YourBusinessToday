import { nextScheduledInvoice } from '$lib/data/books/billingScheduleStanding';
import { billingFrequencyLabels } from '$lib/data/books/billingSchedule';
import type { CustomerRow, ScheduleRow } from '$lib/data/books/page/customerRows';
import type { BillingSchedule } from './billingScheduleRecord';
import type { CustomerWithBalance } from './customerBalances';
import { customerNameOf, type InvoiceNamings } from './invoiceNamings';

/** The customers the Customers tab lists: every one in use, and an archived one only while it still owes. */
export function customerRowsOf(customers: CustomerWithBalance[]): CustomerRow[] {
	return customers.filter(({ customer, balance }) => !customer.isArchived || balance.owed > 0).map(customerRowOf);
}

function customerRowOf({ customer, balance }: CustomerWithBalance): CustomerRow {
	return {
		id: customer.id,
		name: customer.name,
		contact: customer.contactName,
		email: customer.email,
		invoiceCount: balance.invoiceCount,
		owed: balance.owed
	};
}

/** One billing schedule as the Schedules tab lists it, its amount what its next invoice comes to. */
export function scheduleRowOf(schedule: BillingSchedule, namings: InvoiceNamings): ScheduleRow {
	return {
		id: schedule.id,
		customer: customerNameOf(namings, schedule.customerId),
		title: schedule.title,
		amount: nextScheduledInvoice(schedule).total,
		howOften: billingFrequencyLabels[schedule.frequency],
		nextInvoice: schedule.nextInvoiceDate,
		isSentByItself: schedule.sendsByItself,
		isPaused: schedule.isPaused
	};
}
