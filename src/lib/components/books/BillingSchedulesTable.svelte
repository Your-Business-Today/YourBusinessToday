<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { formatPoundsAndPence } from '$lib/data/books/money';
	import type { ScheduleRow } from '$lib/data/books/page/customerRows';

	let { schedules }: { schedules: ScheduleRow[] } = $props();

	const emptyMessage = 'No customer is billed on a schedule yet. Your Claude sets one up through the Your Business Today connector.';
	const yesOrNo = (isSo: boolean) => (isSo ? 'Yes' : 'No');

	const columns: RecordsColumn<ScheduleRow>[] = [
		{ key: 'customer', label: 'Customer', sortValue: (schedule) => schedule.customer },
		{ key: 'title', label: 'Title', sortValue: (schedule) => schedule.title },
		{ key: 'amount', label: 'Amount', isFigure: true, sortValue: (schedule) => schedule.amount },
		{ key: 'howOften', label: 'How often', isWideOnly: true, sortValue: (schedule) => schedule.howOften },
		{ key: 'nextInvoice', label: 'Next invoice', sortValue: (schedule) => schedule.nextInvoice },
		{ key: 'sendsByItself', label: 'Sends by itself', isWideOnly: true },
		{ key: 'paused', label: 'Paused', isWideOnly: true }
	];
</script>

<RecordsTable label="Billing schedules" {columns} rows={schedules} keyOf={(schedule) => schedule.id} {emptyMessage} isCardsOnPhone>
	{#snippet cells(schedule)}
		<RecordsCell kind="link" label="Customer">{schedule.customer}</RecordsCell>
		<RecordsCell label="Title">{schedule.title}</RecordsCell>
		<RecordsCell kind="figure" label="Amount">{formatPoundsAndPence(schedule.amount)}</RecordsCell>
		<RecordsCell label="How often" isWideOnly>{schedule.howOften}</RecordsCell>
		<RecordsCell label="Next invoice">{formatBritishDate(schedule.nextInvoice)}</RecordsCell>
		<RecordsCell label="Sends by itself" isWideOnly>{yesOrNo(schedule.isSentByItself)}</RecordsCell>
		<RecordsCell label="Paused" isWideOnly>{yesOrNo(schedule.isPaused)}</RecordsCell>
	{/snippet}
</RecordsTable>
