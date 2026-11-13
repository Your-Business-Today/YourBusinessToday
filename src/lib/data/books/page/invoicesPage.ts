import type { CustomerRow, ScheduleRow } from './customerRows';
import type { InvoiceRow } from './invoiceRows';

/** The Invoices page's three lists: every invoice, the customers with what each owes, and the billing schedules. */
export type InvoicesPage = { invoices: InvoiceRow[]; customers: CustomerRow[]; schedules: ScheduleRow[] };
