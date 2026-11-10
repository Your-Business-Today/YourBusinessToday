<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { businessBrainPartNames } from '$lib/data/businessBrainRules';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { indexColumns, partBadgeTones } from './businessBrainIndex';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { BusinessBrainIndex, BusinessBrainIndexEntry } from '$lib/server/businessBrain/readBusinessBrainIndex';

	let { index, addresses }: { index: BusinessBrainIndex; addresses: BusinessBrainAddresses } = $props();

	const { entries, pageCount } = $derived(index);
	const hasMorePages = $derived(entries.length < pageCount);
	const emptyMessage = 'Nothing is filed yet. Ask your Claude to file what the business knows through the connector.';

	function pageHref(entry: BusinessBrainIndexEntry): string {
		return addresses.page(entry.pageId);
	}
</script>

<DashboardPanel title="Pages" count={pageCount}>
	{#if hasMorePages}
		<p class="border-b border-hairline px-6 py-3 text-sm text-chalk-muted">
			The first {entries.length} of {pageCount} pages, by title.
		</p>
	{/if}
	<div class="overflow-x-auto">
		<RecordsTable label="Pages of Your Business Brain" columns={indexColumns} rows={entries} keyOf={(entry) => entry.pageId} hrefOf={pageHref} {emptyMessage}>
			{#snippet cells(entry)}
				<RecordsCell kind="link" href={pageHref(entry)}>
					<span class="block">{entry.title}</span>
					<span class="line-clamp-2 block text-xs font-normal text-chalk-subtle">{entry.summary}</span>
				</RecordsCell>
				<RecordsCell kind="status">
					<Badge label={businessBrainPartNames[entry.partKind]} tone={partBadgeTones[entry.partKind]} />
				</RecordsCell>
				<RecordsCell isWideOnly>{entry.kind}</RecordsCell>
				<RecordsCell isWideOnly>{formatBritishDate(entry.updatedAt)}</RecordsCell>
			{/snippet}
		</RecordsTable>
	</div>
</DashboardPanel>
