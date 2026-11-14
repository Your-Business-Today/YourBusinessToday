<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import MapChangesTable from './MapChangesTable.svelte';
	import MapQuestionsTable from './MapQuestionsTable.svelte';
	import { questionsPane, type WorkflowMapPane } from './workflowMapTabs';
	import type { MapChange } from './workflowMapChanges';
	import type { MapQuestion } from '$lib/data/workflowMap/mapQuestions';

	let {
		pane,
		changes,
		questions,
		noChangesMessage,
		onChooseStation
	}: {
		pane: WorkflowMapPane;
		changes: MapChange[];
		questions: MapQuestion[];
		noChangesMessage: string;
		onChooseStation: (stationKey: string) => void;
	} = $props();
</script>

<DashboardPanel>
	{#if pane === questionsPane}
		<MapQuestionsTable {questions} {onChooseStation} />
	{:else}
		<MapChangesTable {changes} emptyMessage={noChangesMessage} />
	{/if}
</DashboardPanel>
