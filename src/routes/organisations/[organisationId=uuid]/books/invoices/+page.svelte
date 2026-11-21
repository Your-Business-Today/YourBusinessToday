<script lang="ts">
	import { untrack } from 'svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import BillingSchedulesTable from '$lib/components/books/BillingSchedulesTable.svelte';
	import BooksCustomersTable from '$lib/components/books/BooksCustomersTable.svelte';
	import InvoicesTable from '$lib/components/books/InvoicesTable.svelte';
	import { invoicesPageTabsOf, isInvoiceTab } from '$lib/components/books/invoicesPageTabs';
	import { framePageLabels } from '$lib/components/frame/moduleFolders';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { booksInvoicePathOf } from '$lib/data/books/page/booksPaths';
	import { describeOwedByCustomers, invoicesOnTab, type InvoiceRow, type InvoiceTabKey } from '$lib/data/books/page/invoiceRows';
	import { cookieRememberingInvoicesTab, SetApartTabs, type InvoicesPageTabKey } from '$lib/data/books/page/invoicesTab';

	let { data } = $props();

	const invoicesTitle = framePageLabels.invoices;
	const emptyMessages: Record<InvoiceTabKey, string> = {
		all: 'The books hold no invoices yet. Your Claude raises them through the Your Business Today connector.',
		draft: 'No invoice is waiting as a draft.',
		unpaid: 'No customer owes anything on an invoice.',
		paid: 'No invoice is paid yet.',
		void: 'No invoice has been made void.'
	};
	const { page, booksOrganisation } = $derived(data);
	let selectedTab: InvoicesPageTabKey = $state(untrack(() => data.rememberedTab));
	const tabs = $derived(invoicesPageTabsOf(page));
	const invoiceHrefOf = (invoice: InvoiceRow) => booksInvoicePathOf(booksOrganisation.id, invoice.id);

	function pickTab(key: string) {
		selectedTab = key as InvoicesPageTabKey;
		document.cookie = cookieRememberingInvoicesTab(selectedTab);
	}
</script>

<svelte:head>
	<title>{invoicesTitle} — {booksOrganisation.name}</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={invoicesTitle}>
	<p class="text-sm text-chalk-subtle">{describeOwedByCustomers(page.invoices)}</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<nav aria-label="Invoices by status, customers and schedules">
		<TabStrip {tabs} bind:selectedKey={() => selectedTab, pickTab} />
	</nav>
	<DashboardPanel>
		{#if isInvoiceTab(selectedTab)}
			<InvoicesTable invoices={invoicesOnTab(page.invoices, selectedTab)} hrefOf={invoiceHrefOf} emptyMessage={emptyMessages[selectedTab]} />
		{:else if selectedTab === SetApartTabs.customers}
			<BooksCustomersTable customers={page.customers} />
		{:else}
			<BillingSchedulesTable schedules={page.schedules} />
		{/if}
	</DashboardPanel>
</div>
