<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import AccountEntriesTable from '$lib/components/books/AccountEntriesTable.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { framePageLabels } from '$lib/components/frame/moduleFolders';

	let { data } = $props();

	const { account, period, booksOrganisation, rows, closingBalance, booksHref } = $derived(data);
	const accountTitle = $derived(`${account.code} ${account.name}`);
	const crumbs = $derived([{ label: framePageLabels.reports, href: booksHref }]);
	const firstDay = $derived(period.start === null ? 'the start of the books' : formatBritishDate(period.start));
</script>

<svelte:head>
	<title>{accountTitle} — {booksOrganisation.name}</title>
</svelte:head>

<WorkspaceHeader {crumbs} title={accountTitle}>
	<p class="text-sm text-chalk-subtle">The entries behind this figure, from {firstDay} to {formatBritishDate(period.end)}.</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<DashboardPanel title="Entries" count={rows.length}>
		<div class="overflow-x-auto">
			<AccountEntriesTable {rows} {closingBalance} />
		</div>
	</DashboardPanel>
</div>
