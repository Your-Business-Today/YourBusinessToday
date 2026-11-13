<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { relationshipTermsWords } from './domainPlainWords';
	import type { DomainAreaRelationship } from '$lib/data/organisationDomain';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { relationships }: { relationships: DomainAreaRelationship[] } = $props();

	const columns: RecordsColumn<DomainAreaRelationship>[] = [
		{ key: 'from', label: 'From', sortValue: (relationship) => relationship.fromTitle },
		{ key: 'to', label: 'To', sortValue: (relationship) => relationship.toTitle },
		{ key: 'passes', label: 'What passes' },
		{ key: 'terms', label: 'Whose terms', isWideOnly: true }
	];

	const keyOf = ({ fromContextSlug, toContextSlug }: DomainAreaRelationship) => `${fromContextSlug}:${toContextSlug}`;
</script>

<RecordsTable
	label="How the areas relate"
	{columns}
	rows={relationships}
	{keyOf}
	isCardsOnPhone
	emptyMessage="No area has been said to pass anything to another yet."
>
	{#snippet cells(relationship)}
		<RecordsCell>{relationship.fromTitle}</RecordsCell>
		<RecordsCell label="To">{relationship.toTitle}</RecordsCell>
		<RecordsCell label="What passes">{relationship.passes}</RecordsCell>
		<RecordsCell isWideOnly label="Whose terms">{relationshipTermsWords[relationship.pattern]}</RecordsCell>
	{/snippet}
</RecordsTable>
