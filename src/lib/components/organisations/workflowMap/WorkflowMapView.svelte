<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import TabStrip from '$lib/components/workspace/TabStrip.svelte';
	import MapChangesTable from './MapChangesTable.svelte';
	import StationPanel from './StationPanel.svelte';
	import WorkflowMapPanel from './WorkflowMapPanel.svelte';
	import { drawnWorkflowMapsOf } from './drawnWorkflowMaps';
	import { estimatedTextWidth, loadedTextMeasure, type MeasureText } from '$lib/components/lineMap/layout/textMeasure';
	import { isComparing, shownStageOf, workflowMapTabsOf, type WorkflowMapPane } from './workflowMapTabs';
	import { mapChangesBetween } from './workflowMapChanges';
	import { mapStage, type MapStage } from '$lib/data/workflowMap/workflowMap';
	import { stationDetailsOf } from './stationDetails';
	import type { StationDomain } from '$lib/data/domainReading';
	import type { OrganisationWorkflowMaps } from '$lib/data/workflowMap/organisationWorkflowMaps';
	import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

	let {
		maps,
		openingStage,
		chosenStationKey,
		messages,
		stationDomain,
		organisationId,
		belowStation
	}: {
		maps: OrganisationWorkflowMaps;
		openingStage: MapStage;
		chosenStationKey: string | null;
		messages: { chooseStation: string; noChanges: string };
		stationDomain: StationDomain;
		organisationId: string | null;
		belowStation?: Snippet<[WorkflowMapVersion, string | null]>;
	} = $props();

	let measure: MeasureText = $state(estimatedTextWidth);
	let pickedPane: WorkflowMapPane | null = $state(null);
	let pickedStationKey: string | null = $state(null);

	onMount(() => {
		loadedTextMeasure().then((loaded) => (measure = loaded));
	});

	const drawn = $derived(drawnWorkflowMapsOf(maps, measure));
	const pane = $derived(pickedPane ?? openingStage);
	const shownStage = $derived(shownStageOf(pane));
	const shownMap = $derived(shownStage === null ? null : maps[shownStage]);
	const shownLineMap = $derived(shownStage === null ? null : drawn.lineMaps[shownStage]);
	const changes = $derived(mapChangesBetween(maps));
	const tabs = $derived(isComparing(maps) ? workflowMapTabsOf(changes.length) : null);
	const selectedStationKey = $derived(pickedStationKey ?? chosenStationKey);
	const surroundings = $derived({
		earlierMap: shownStage === mapStage.after ? maps.before : null,
		colours: drawn.colours,
		productNames: maps.productNames
	});
	const details = $derived(
		shownMap === null || selectedStationKey === null ? null : stationDetailsOf(shownMap, surroundings, selectedStationKey)
	);

	function choosePane(key: string): void {
		pickedPane = key as WorkflowMapPane;
	}

	function chooseStation(stationKey: string): void {
		pickedStationKey = stationKey;
	}
</script>

{#if tabs !== null}
	<nav aria-label="Workflow map">
		<TabStrip {tabs} bind:selectedKey={() => pane, choosePane} />
	</nav>
{/if}
{#if shownStage !== null && shownLineMap !== null && shownMap !== null}
	<WorkflowMapPanel map={shownLineMap} stage={shownStage} layout={drawn.layout} selectedStationId={details?.key} onChooseStation={chooseStation} />
	{#if details !== null}
		<StationPanel {details} {stationDomain} {organisationId} />
	{/if}
	{#if belowStation !== undefined}
		{@render belowStation(shownMap, details?.key ?? null)}
	{:else if details === null}
		<p class="text-sm text-chalk-subtle">{messages.chooseStation}</p>
	{/if}
{:else}
	<DashboardPanel>
		<MapChangesTable {changes} emptyMessage={messages.noChanges} />
	</DashboardPanel>
{/if}
