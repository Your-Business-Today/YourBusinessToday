<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import LoansTable from '$lib/components/books/LoansTable.svelte';
	import LoanStatementModal from '$lib/components/books/LoanStatementModal.svelte';
	import { framePageLabels } from '$lib/components/frame/moduleFolders';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { describeLoansStanding, type LoanRow } from '$lib/data/books/page/loanRows';

	let { data } = $props();

	const loansTitle = framePageLabels.loans;
	const { loans, booksOrganisation } = $derived(data);
	let openedLoan: LoanRow | null = $state(null);
	let isStatementOpen = $state(false);

	function openStatement(loan: LoanRow) {
		openedLoan = loan;
		isStatementOpen = true;
	}
</script>

<svelte:head>
	<title>{loansTitle} — {booksOrganisation.name}</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={loansTitle}>
	<p class="text-sm text-chalk-subtle">{describeLoansStanding(loans)}</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<DashboardPanel title="Loan accounts" count={loans.length}>
		<LoansTable {loans} onOpen={openStatement} />
	</DashboardPanel>
</div>

{#if openedLoan !== null}
	<LoanStatementModal loan={openedLoan} bind:isOpen={isStatementOpen} />
{/if}
