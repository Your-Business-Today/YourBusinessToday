<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { DomainSource } from '$lib/server/businessBrain/readDomainSources';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { sources }: { sources: DomainSource[] } = $props();

	const columns: RecordsColumn<DomainSource>[] = [
		{ key: 'source', label: 'Source' },
		{ key: 'origin', label: 'Where it came from', isWideOnly: true },
		{ key: 'filed', label: 'Filed', sortValue: (source) => source.filedAt }
	];
</script>

<RecordsTable
	label="Sources"
	{columns}
	rows={sources}
	keyOf={(source) => source.sourceId}
	isDense
	isCardsOnPhone
	emptyMessage="No source is recorded for its page."
>
	{#snippet cells(source)}
		<RecordsCell>{source.title}</RecordsCell>
		<RecordsCell isWideOnly label="Where it came from">{source.origin}</RecordsCell>
		<RecordsCell label="Filed">{formatBritishDate(source.filedAt)}</RecordsCell>
	{/snippet}
</RecordsTable>
