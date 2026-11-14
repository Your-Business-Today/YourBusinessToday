<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { formatPoundsAndPence } from '$lib/data/books/money';
	import type { InvoiceRow } from '$lib/data/books/page/invoiceRows';
	import { invoiceRowStatusOf } from './invoiceRowStatus';

	let { invoices, hrefOf, emptyMessage }: { invoices: InvoiceRow[]; hrefOf: (invoice: InvoiceRow) => string; emptyMessage: string } = $props();

	const neverSent = '';

	const columns: RecordsColumn<InvoiceRow>[] = [
		{ key: 'number', label: 'Number', sortValue: (invoice) => invoice.invoiceNumber },
		{ key: 'customer', label: 'Customer', sortValue: (invoice) => invoice.customer },
		{ key: 'dated', label: 'Dated', isWideOnly: true, sortValue: (invoice) => invoice.dated },
		{ key: 'due', label: 'Due', sortValue: (invoice) => invoice.due },
		{ key: 'total', label: 'Total', isFigure: true, isWideOnly: true, sortValue: (invoice) => invoice.total },
		{ key: 'owed', label: 'Owed', isFigure: true, sortValue: (invoice) => invoice.owed },
		{ key: 'status', label: 'Status', sortValue: (invoice) => invoice.daysOverdue ?? 0 },
		{ key: 'sent', label: 'Sent', isWideOnly: true, sortValue: (invoice) => invoice.sentAt ?? neverSent }
	];
</script>

<RecordsTable label="Invoices" {columns} rows={invoices} keyOf={(invoice) => invoice.id} {hrefOf} {emptyMessage} isCardsOnPhone>
	{#snippet cells(invoice)}
		{@const status = invoiceRowStatusOf(invoice)}
		<RecordsCell kind="link" label="Number" href={hrefOf(invoice)}>{invoice.number}</RecordsCell>
		<RecordsCell label="Customer">{invoice.customer}</RecordsCell>
		<RecordsCell label="Dated" isWideOnly>{formatBritishDate(invoice.dated)}</RecordsCell>
		<RecordsCell label="Due">{formatBritishDate(invoice.due)}</RecordsCell>
		<RecordsCell kind="figure" label="Total" isWideOnly>{formatPoundsAndPence(invoice.total)}</RecordsCell>
		<RecordsCell kind="figure" label="Owed">{formatPoundsAndPence(invoice.owed)}</RecordsCell>
		<RecordsCell kind="status" label="Status"><Badge label={status.label} tone={status.tone} hasDot /></RecordsCell>
		<RecordsCell label="Sent" isWideOnly>{invoice.sentAt === null ? neverSent : formatBritishDate(invoice.sentAt)}</RecordsCell>
	{/snippet}
</RecordsTable>
