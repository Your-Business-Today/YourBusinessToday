<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { domainThingHref } from './domainTabs';
	import { thingKindWord } from './domainPlainWords';
	import type { DomainThing } from '$lib/data/domainReading';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { members }: { members: DomainThing[] } = $props();

	const columns: RecordsColumn<DomainThing>[] = [
		{ key: 'member', label: 'Member' },
		{ key: 'kind', label: 'Kind' },
		{ key: 'area', label: 'Area', isWideOnly: true },
		{ key: 'summary', label: 'What it is', isWideOnly: true }
	];
</script>

<RecordsTable
	label="Members"
	{columns}
	rows={members}
	keyOf={(member) => member.pageId}
	hrefOf={(member) => domainThingHref(member.slug)}
	isDense
	isCardsOnPhone
	emptyMessage="No members are named for this group yet."
>
	{#snippet cells(member)}
		<RecordsCell kind="link" href={domainThingHref(member.slug)}>{member.title}</RecordsCell>
		<RecordsCell label="Kind">{thingKindWord(member.kind)}</RecordsCell>
		<RecordsCell isWideOnly label="Area">{member.areaTitle}</RecordsCell>
		<RecordsCell isWideOnly label="What it is">{member.summary}</RecordsCell>
	{/snippet}
</RecordsTable>
