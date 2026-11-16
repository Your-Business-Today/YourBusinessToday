<script lang="ts">
	import type { Snippet } from 'svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import MapChangesTable from './MapChangesTable.svelte';
	import MapProductsTable from './MapProductsTable.svelte';
	import MapQuestionsTable from './MapQuestionsTable.svelte';
	import PeopleInTheLoopTable from './PeopleInTheLoopTable.svelte';
	import { isTablePane, type WorkflowMapPane, type WorkflowMapTable } from './workflowMapTabs';
	import { peopleInTheLoopOf } from '$lib/data/workflowMap/peopleInTheLoop';
	import { productsOnTheMap } from '$lib/data/workflowMap/productsOnTheMap';
	import type { MapChange } from './workflowMapChanges';
	import type { MapQuestion } from '$lib/data/workflowMap/mapQuestions';
	import type { OrganisationWorkflowMaps } from '$lib/data/workflowMap/organisationWorkflowMaps';

	let {
		pane,
		maps,
		changes,
		questions,
		noChangesMessage,
		onChooseStation
	}: {
		pane: WorkflowMapPane;
		maps: OrganisationWorkflowMaps;
		changes: MapChange[];
		questions: MapQuestion[];
		noChangesMessage: string;
		onChooseStation: (stationKey: string) => void;
	} = $props();

	const tables: Record<WorkflowMapTable, Snippet> = {
		changes: changesTable,
		products: productsTable,
		people: peopleTable,
		questions: questionsTable
	};
</script>

{#snippet changesTable()}
	<MapChangesTable {changes} emptyMessage={noChangesMessage} />
{/snippet}

{#snippet productsTable()}
	<MapProductsTable products={productsOnTheMap(maps)} />
{/snippet}

{#snippet peopleTable()}
	<PeopleInTheLoopTable people={peopleInTheLoopOf(maps)} />
{/snippet}

{#snippet questionsTable()}
	<MapQuestionsTable {questions} {onChooseStation} />
{/snippet}

<DashboardPanel>
	{#if isTablePane(pane)}
		{@render tables[pane]()}
	{/if}
</DashboardPanel>
