<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { BusinessBrainIndexEntry } from '$lib/server/businessBrain/readBusinessBrainIndex';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { pages, addresses, emptyMessage }: { pages: BusinessBrainIndexEntry[]; addresses: BusinessBrainAddresses; emptyMessage: string } =
		$props();

	const columns: RecordsColumn<BusinessBrainIndexEntry>[] = [
		{ key: 'title', label: 'Page', sortValue: (page) => page.title },
		{ key: 'kind', label: 'Kind', sortValue: (page) => page.kind },
		{ key: 'filed', label: 'Filed', isWideOnly: true, sortValue: (page) => page.updatedAt }
	];

	function pageHref(page: BusinessBrainIndexEntry): string {
		return addresses.page(page.pageId);
	}
</script>

<RecordsTable label="Pages" {columns} rows={pages} keyOf={(page) => page.pageId} hrefOf={pageHref} isCardsOnPhone {emptyMessage}>
	{#snippet cells(page)}
		<RecordsCell kind="link" href={pageHref(page)}>
			<span class="block">{page.title}</span>
			<span class="line-clamp-2 block text-xs font-normal text-chalk-subtle">{page.summary}</span>
		</RecordsCell>
		<RecordsCell label="Kind">{page.kind}</RecordsCell>
		<RecordsCell isWideOnly>{formatBritishDate(page.updatedAt)}</RecordsCell>
	{/snippet}
</RecordsTable>
