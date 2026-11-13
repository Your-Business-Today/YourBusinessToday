<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { wordKey } from '$lib/data/domainWords';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { DomainWord } from '$lib/data/domainReading';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { words, addresses }: { words: DomainWord[]; addresses: BusinessBrainAddresses } = $props();

	const columns: RecordsColumn<DomainWord>[] = [
		{ key: 'word', label: 'Word', sortValue: (word) => word.word },
		{ key: 'meaning', label: 'What it means' },
		{ key: 'area', label: 'Area', isWideOnly: true, sortValue: (word) => word.areaTitle }
	];
</script>

<RecordsTable
	label="Words"
	{columns}
	rows={words}
	keyOf={wordKey}
	isCardsOnPhone
	emptyMessage="No word has been filed yet."
>
	{#snippet cells(word)}
		<RecordsCell kind="link" href={addresses.page(word.glossaryPageId)}>{word.word}</RecordsCell>
		<RecordsCell label="What it means">{word.meaning}</RecordsCell>
		<RecordsCell isWideOnly>{word.areaTitle}</RecordsCell>
	{/snippet}
</RecordsTable>
