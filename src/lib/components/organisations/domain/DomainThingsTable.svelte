<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { domainThingHref } from './domainTabs';
	import { rulesGoverning } from '$lib/data/domainThingLinks';
	import { thingKindWord } from './domainPlainWords';
	import type { DomainRule, DomainThing } from '$lib/data/domainReading';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { things, rules }: { things: DomainThing[]; rules: DomainRule[] } = $props();

	const ruleCountOf = (thing: DomainThing) => rulesGoverning(rules, thing.slug).length;

	const columns: RecordsColumn<DomainThing>[] = [
		{ key: 'thing', label: 'Thing', sortValue: (thing) => thing.title },
		{ key: 'area', label: 'Area', sortValue: (thing) => thing.areaTitle },
		{ key: 'kind', label: 'Kind', isWideOnly: true, sortValue: (thing) => thingKindWord(thing.kind) },
		{ key: 'summary', label: 'What it is', isWideOnly: true },
		{ key: 'rules', label: 'Rules', isFigure: true, sortValue: ruleCountOf }
	];
</script>

<RecordsTable
	label="Things"
	{columns}
	rows={things}
	keyOf={(thing) => thing.pageId}
	hrefOf={(thing) => domainThingHref(thing.slug)}
	isCardsOnPhone
	emptyMessage="No thing has been filed yet."
>
	{#snippet cells(thing)}
		<RecordsCell kind="link" href={domainThingHref(thing.slug)}>{thing.title}</RecordsCell>
		<RecordsCell label="Area">{thing.areaTitle}</RecordsCell>
		<RecordsCell isWideOnly label="Kind">{thingKindWord(thing.kind)}</RecordsCell>
		<RecordsCell isWideOnly label="What it is">{thing.summary}</RecordsCell>
		<RecordsCell kind="figure" label="Rules">{ruleCountOf(thing)}</RecordsCell>
	{/snippet}
</RecordsTable>
