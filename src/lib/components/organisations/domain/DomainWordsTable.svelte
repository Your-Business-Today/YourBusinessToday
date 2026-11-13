<script lang="ts">
	import DomainWordNames from './DomainWordNames.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { wordKey } from '$lib/data/domainWords';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { DomainWord } from '$lib/data/domainReading';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let {
		words,
		thingTitles,
		wordStationCounts,
		addresses
	}: {
		words: DomainWord[];
		thingTitles: Map<string, string>;
		wordStationCounts: Record<string, number>;
		addresses: BusinessBrainAddresses;
	} = $props();

	const stationCountOf = (word: DomainWord) => wordStationCounts[wordKey(word)] ?? 0;

	const columns: RecordsColumn<DomainWord>[] = [
		{ key: 'word', label: 'Word', sortValue: (word) => word.word },
		{ key: 'meaning', label: 'What it means' },
		{ key: 'names', label: 'Names', sortValue: (word) => word.namesThingSlug ?? '' },
		{ key: 'otherNames', label: 'Also called', isWideOnly: true },
		{ key: 'stations', label: 'Stations', sortValue: stationCountOf },
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
		<RecordsCell label="Names"><DomainWordNames {word} {thingTitles} /></RecordsCell>
		<RecordsCell isWideOnly label="Also called">{word.otherNames.join(', ')}</RecordsCell>
		<RecordsCell label="Stations">{stationCountOf(word)}</RecordsCell>
		<RecordsCell isWideOnly>{word.areaTitle}</RecordsCell>
	{/snippet}
</RecordsTable>
