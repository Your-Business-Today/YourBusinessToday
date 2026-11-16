<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { loopWords, stepsListed } from '$lib/data/workflowMap/productAndLoopWords';
	import type { PersonInTheLoop, StepInAProduct, StepTakenOff } from '$lib/data/workflowMap/peopleInTheLoop';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { people }: { people: PersonInTheLoop[] } = $props();

	const columns: RecordsColumn<PersonInTheLoop>[] = [
		{ key: 'role', label: loopWords.role, sortValue: (person) => person.roleName },
		{ key: 'stays', label: loopWords.staysTheirs },
		{ key: 'inside', label: loopWords.insideOurProducts },
		{ key: 'taken', label: loopWords.takenOffTheirHands }
	];

	function stepInItsProduct({ stationName, productName }: StepInAProduct): string {
		return `${stationName} (${productName})`;
	}

	function stepWhereItWent({ stationName, nowDoneBy }: StepTakenOff): string {
		return `${stationName} (${nowDoneBy ?? loopWords.noLongerDone})`;
	}
</script>

<RecordsTable label={loopWords.label} {columns} rows={people} keyOf={(person) => person.roleKey} isCardsOnPhone emptyMessage={loopWords.noRoles}>
	{#snippet cells(person)}
		<RecordsCell>{person.roleName}</RecordsCell>
		<RecordsCell label={loopWords.staysTheirs}>{stepsListed(person.staysTheirs, loopWords.nothing)}</RecordsCell>
		<RecordsCell label={loopWords.insideOurProducts}>{stepsListed(person.insideOurProducts.map(stepInItsProduct), loopWords.nothing)}</RecordsCell>
		<RecordsCell label={loopWords.takenOffTheirHands}>{stepsListed(person.takenOffTheirHands.map(stepWhereItWent), loopWords.nothing)}</RecordsCell>
	{/snippet}
</RecordsTable>
