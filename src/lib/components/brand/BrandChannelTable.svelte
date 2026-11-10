<script lang="ts">
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { ChannelEntry } from '$lib/brand/projections/brandKitPage';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { entries }: { entries: ChannelEntry[] } = $props();

	const columns: RecordsColumn<ChannelEntry>[] = [
		{ key: 'channel', label: 'Channel', sortValue: (entry) => entry.channel },
		{ key: 'trait', label: 'What', sortValue: (entry) => entry.label },
		{ key: 'value', label: 'Set to' },
		{ key: 'reason', label: 'Why', isWideOnly: true },
		{ key: 'decided', label: 'Decided', isWideOnly: true, sortValue: (entry) => entry.decidedOn }
	];
</script>

<div class="overflow-x-auto">
	<RecordsTable label="Set for one channel" {columns} rows={entries} keyOf={(entry) => entry.key} emptyMessage="Nothing is set for one channel only.">
		{#snippet cells(entry)}
			<RecordsCell>{entry.channel}</RecordsCell>
			<RecordsCell>{entry.label}</RecordsCell>
			<RecordsCell>{entry.value}</RecordsCell>
			<RecordsCell isWideOnly>{entry.reason}</RecordsCell>
			<RecordsCell isWideOnly>{formatBritishDate(entry.decidedOn)}</RecordsCell>
		{/snippet}
	</RecordsTable>
</div>
