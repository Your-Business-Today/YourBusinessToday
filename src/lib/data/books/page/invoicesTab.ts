import { invoiceTabKeys } from './invoiceRows';

/** The tabs set apart from the invoices by status: the customers and the billing schedules. */
export const SetApartTabs = { customers: 'customers', schedules: 'schedules' } as const;

/** Every tab of the Invoices page: the invoices by status, then, set apart from them, the customers and the schedules. */
export const invoicesPageTabKeys = [...invoiceTabKeys, SetApartTabs.customers, SetApartTabs.schedules] as const;

export type InvoicesPageTabKey = (typeof invoicesPageTabKeys)[number];

export const invoicesTabCookie = 'books_invoices_tab';

const tabOnFirstVisit: InvoicesPageTabKey = 'unpaid';
const yearInSeconds = 60 * 60 * 24 * 365;

/** The tab a person last had the Invoices page on, as their browser sends it back; Unpaid when it names no tab. */
export function rememberedInvoicesTab(cookieValue: string | undefined): InvoicesPageTabKey {
	return invoicesPageTabKeys.find((key) => key === cookieValue) ?? tabOnFirstVisit;
}

/** A cookie rather than the browser's own storage, so the server draws the page already on the tab. */
export function cookieRememberingInvoicesTab(tab: InvoicesPageTabKey): string {
	return `${invoicesTabCookie}=${tab}; path=/organisations; max-age=${yearInSeconds}; samesite=lax`;
}
