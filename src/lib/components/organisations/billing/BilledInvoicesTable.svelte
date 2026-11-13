<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { formatPoundsAndPence } from '$lib/data/books/money';
	import { invoiceStatusLabels, invoiceStatusTones } from '$lib/components/books/invoiceDocumentView';
	import type { BilledOrganisationInvoice } from '$lib/data/books/organisationBilling';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { invoices }: { invoices: BilledOrganisationInvoice[] } = $props();

	const columns: RecordsColumn<BilledOrganisationInvoice>[] = [
		{ key: 'number', label: 'Number' },
		{ key: 'dated', label: 'Dated', sortValue: (invoice) => invoice.issueDate },
		{ key: 'for', label: 'For' },
		{ key: 'total', label: 'Total', isFigure: true, sortValue: (invoice) => invoice.total },
		{ key: 'status', label: 'Status' },
		{ key: 'sent', label: 'Sent' }
	];
</script>

<DashboardPanel title="Invoices raised" count={invoices.length}>
	<RecordsTable
		label="Invoices raised"
		{columns}
		rows={invoices}
		keyOf={(invoice) => invoice.id}
		hrefOf={(invoice) => invoice.documentHref}
		isCardsOnPhone
		emptyMessage="No invoice has been raised to this organisation yet."
	>
		{#snippet cells(invoice)}
			<RecordsCell kind="link">{invoice.printedNumber}</RecordsCell>
			<RecordsCell label="Dated">{formatBritishDate(invoice.issueDate)}</RecordsCell>
			<RecordsCell label="For">{invoice.reference}</RecordsCell>
			<RecordsCell kind="figure" label="Total">{formatPoundsAndPence(invoice.total)}</RecordsCell>
			<RecordsCell kind="status" label="Status">
				<Badge label={invoiceStatusLabels[invoice.status]} tone={invoiceStatusTones[invoice.status]} />
			</RecordsCell>
			<RecordsCell label="Sent">{invoice.isSent ? 'Sent' : 'Not sent'}</RecordsCell>
		{/snippet}
	</RecordsTable>
</DashboardPanel>
