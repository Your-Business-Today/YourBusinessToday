<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { relationshipLabels, type LoanRow } from '$lib/data/books/page/loanRows';

	let { loans, onOpen }: { loans: LoanRow[]; onOpen: (loan: LoanRow) => void } = $props();

	const neverMoved = '';
	const emptyMessage = 'No loan accounts are kept yet.';

	const columns: RecordsColumn<LoanRow>[] = [
		{ key: 'person', label: 'Person', sortValue: (loan) => loan.personName },
		{ key: 'relationship', label: 'Relationship', isWideOnly: true, sortValue: (loan) => loan.relationship },
		{ key: 'balance', label: 'Balance', sortValue: (loan) => loan.balance },
		{ key: 'lastMovement', label: 'Last movement', sortValue: (loan) => loan.lastMovement ?? neverMoved }
	];
</script>

<RecordsTable label="Loan accounts" {columns} rows={loans} keyOf={(loan) => loan.id} {onOpen} {emptyMessage} isCardsOnPhone>
	{#snippet cells(loan)}
		<RecordsCell kind="link" label="Person">{loan.personName}</RecordsCell>
		<RecordsCell label="Relationship" isWideOnly>{relationshipLabels[loan.relationship]}{loan.isClosed ? ', closed' : ''}</RecordsCell>
		<RecordsCell label="Balance">{loan.owedInWords}</RecordsCell>
		<RecordsCell label="Last movement">{loan.lastMovement === null ? neverMoved : formatBritishDate(loan.lastMovement)}</RecordsCell>
	{/snippet}
</RecordsTable>
