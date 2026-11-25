<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import CashflowForecastTable from '$lib/components/books/CashflowForecastTable.svelte';
	import CashflowItemsTable from '$lib/components/books/CashflowItemsTable.svelte';
	import LoanBudgetLinesTable from '$lib/components/books/LoanBudgetLinesTable.svelte';
	import { framePageLabels } from '$lib/components/frame/moduleFolders';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const cashflowTitle = framePageLabels.cashflow;
	const { standing, months, items, loanBudgets, booksOrganisation } = $derived(data);
</script>

<svelte:head>
	<title>{cashflowTitle} — {booksOrganisation.name}</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={cashflowTitle}>
	<p class="text-sm text-chalk-subtle">{standing}</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<DashboardPanel title="Twelve-month forecast" count={months.length}>
		<CashflowForecastTable {months} />
	</DashboardPanel>
	<DashboardPanel title="Forecast items" count={items.length}>
		<CashflowItemsTable {items} />
	</DashboardPanel>
	{#each loanBudgets as budget (budget.id)}
		<DashboardPanel title="Loan budget: {budget.title}" count={budget.lineCount}>
			<p class="mb-3 text-sm text-chalk-subtle">{budget.standing}</p>
			<LoanBudgetLinesTable lines={budget.lines} label="Lines of {budget.title}" />
		</DashboardPanel>
	{/each}
</div>
