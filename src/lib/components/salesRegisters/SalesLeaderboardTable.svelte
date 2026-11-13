<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';
	import type { SalesStanding } from '$lib/data/salesLeaderboard';

	let { standings }: { standings: SalesStanding[] } = $props();

	const columns: RecordsColumn<SalesStanding>[] = [
		{ key: 'place', label: '#' },
		{ key: 'person', label: 'Person', sortValue: (standing) => standing.name },
		{ key: 'broughtIn', label: 'Brought in', isFigure: true, sortValue: (standing) => standing.broughtIn },
		{ key: 'open', label: 'Open leads', isFigure: true, sortValue: (standing) => standing.open },
		{ key: 'won', label: 'Won', isFigure: true, sortValue: (standing) => standing.won },
		{ key: 'lost', label: 'Lost', isFigure: true, isWideOnly: true, sortValue: (standing) => standing.lost }
	];

	function placeOf(standing: SalesStanding): number {
		return standings.indexOf(standing) + 1;
	}
</script>

<RecordsTable
	label="Leaderboard"
	{columns}
	rows={standings}
	keyOf={(standing) => standing.personId ?? standing.name}
	emptyMessage="Nobody on the staff yet."
>
	{#snippet cells(standing)}
		<RecordsCell label="#">{placeOf(standing)}</RecordsCell>
		<RecordsCell label="Person">{standing.name}</RecordsCell>
		<RecordsCell kind="figure" label="Brought in">{standing.broughtIn}</RecordsCell>
		<RecordsCell kind="figure" label="Open leads">{standing.open}</RecordsCell>
		<RecordsCell kind="figure" label="Won">{standing.won}</RecordsCell>
		<RecordsCell kind="figure" label="Lost" isWideOnly>{standing.lost}</RecordsCell>
	{/snippet}
</RecordsTable>
