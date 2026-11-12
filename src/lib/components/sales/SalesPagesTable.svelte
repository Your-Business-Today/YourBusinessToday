<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import type { SalesPage } from '$lib/data/salesPages';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { pages }: { pages: SalesPage[] } = $props();

	const columns: RecordsColumn<SalesPage>[] = [
		{ key: 'page', label: 'Page' },
		{ key: 'purpose', label: 'What it holds' }
	];
</script>

<RecordsTable label="Sales pages" {columns} rows={pages} keyOf={(page) => page.href} hrefOf={(page) => page.href}>
	{#snippet cells(page)}
		<RecordsCell kind="link" href={page.href}>{page.label}</RecordsCell>
		<RecordsCell>{page.purpose}</RecordsCell>
	{/snippet}
</RecordsTable>
