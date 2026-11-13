<script lang="ts">
	import Modal from '$lib/components/site/Modal.svelte';
	import LoanStatementTable from './LoanStatementTable.svelte';
	import { describeOverdrawnStretch, loanStatementRowsOf } from '$lib/data/books/page/loanStatementRows';
	import type { LoanRow } from '$lib/data/books/page/loanRows';

	let { loan, isOpen = $bindable() }: { loan: LoanRow; isOpen: boolean } = $props();

	const statementWidthClass = 'max-w-4xl';
	const title = $derived(`${loan.personName}'s loan account`);
	const statement = $derived(loan.statement);
	const rows = $derived(loanStatementRowsOf(statement));
	const stretches = $derived(statement.overdrawnStretches);
</script>

<Modal {title} bind:isOpen maxWidthClass={statementWidthClass}>
	<div class="flex flex-col gap-4">
		<p class="text-sm text-chalk-subtle">{loan.owedInWords}</p>
		{#each stretches as stretch (stretch.from)}
			<p class="text-sm text-signal">{describeOverdrawnStretch(stretch)}</p>
		{/each}
		<div class="overflow-x-auto">
			<LoanStatementTable {rows} />
		</div>
	</div>
</Modal>
