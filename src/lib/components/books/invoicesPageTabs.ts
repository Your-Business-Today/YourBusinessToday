import type { Tab } from '$lib/components/workspace/TabStrip.svelte';
import { countShownOnTab } from '$lib/components/workspace/countShownOnTab';
import { invoicesOnTab, invoiceTabKeys, type InvoiceTabKey } from '$lib/data/books/page/invoiceRows';
import { SetApartTabs, type InvoicesPageTabKey } from '$lib/data/books/page/invoicesTab';
import type { InvoicesPage } from '$lib/data/books/page/invoicesPage';

const invoiceTabLabels: Record<InvoiceTabKey, string> = { all: 'All', draft: 'Draft', unpaid: 'Unpaid', paid: 'Paid', void: 'Void' };

const lastInvoiceTab: InvoiceTabKey = 'void';

/** The Invoices page's tabs, each counting what it lists, with Customers and Schedules set apart after Void. */
export function invoicesPageTabsOf(page: InvoicesPage): Tab[] {
	const { invoices, customers, schedules } = page;
	const invoiceTabs = invoiceTabKeys.map((key) => ({
		key,
		label: invoiceTabLabels[key],
		count: countShownOnTab(invoicesOnTab(invoices, key).length),
		isSetApart: key === lastInvoiceTab
	}));
	const customersTab = { key: SetApartTabs.customers, label: 'Customers', count: countShownOnTab(customers.length) };
	const schedulesTab = { key: SetApartTabs.schedules, label: 'Schedules', count: countShownOnTab(schedules.length) };
	return [...invoiceTabs, customersTab, schedulesTab];
}

/** Whether a tab lists invoices, rather than the customers or the schedules. */
export function isInvoiceTab(tab: InvoicesPageTabKey): tab is InvoiceTabKey {
	return (invoiceTabKeys as readonly string[]).includes(tab);
}
