<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import { formatPoundsAndPence } from '$lib/data/books/money';
	import type { CustomerRow } from '$lib/data/books/page/customerRows';

	let { customers }: { customers: CustomerRow[] } = $props();

	const emptyMessage = 'The books hold no customers yet. Your Claude adds them through the Your Business Today connector.';

	const columns: RecordsColumn<CustomerRow>[] = [
		{ key: 'name', label: 'Name', sortValue: (customer) => customer.name },
		{ key: 'contact', label: 'Contact', isWideOnly: true, sortValue: (customer) => customer.contact },
		{ key: 'email', label: 'Email', isWideOnly: true },
		{ key: 'invoices', label: 'Invoices', isFigure: true, sortValue: (customer) => customer.invoiceCount },
		{ key: 'owed', label: 'Owed', isFigure: true, sortValue: (customer) => customer.owed }
	];
</script>

<RecordsTable label="Customers" {columns} rows={customers} keyOf={(customer) => customer.id} {emptyMessage} isCardsOnPhone>
	{#snippet cells(customer)}
		<RecordsCell kind="link" label="Name">{customer.name}</RecordsCell>
		<RecordsCell label="Contact" isWideOnly>{customer.contact}</RecordsCell>
		<RecordsCell label="Email" isWideOnly>{customer.email}</RecordsCell>
		<RecordsCell kind="figure" label="Invoices">{customer.invoiceCount}</RecordsCell>
		<RecordsCell kind="figure" label="Owed">{formatPoundsAndPence(customer.owed)}</RecordsCell>
	{/snippet}
</RecordsTable>
