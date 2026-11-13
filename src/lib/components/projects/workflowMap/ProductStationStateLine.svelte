<script lang="ts">
	import { productStationStateNames } from './productWorkflowMapWords';
	import { stationState, type StationState } from '$lib/data/workflowMap/workflowMap';

	let { state }: { state: StationState } = $props();

	const isOurs = $derived(state === stationState.ours);
	const isPlanned = $derived(state === stationState.planned);
</script>

<span class="flex items-center gap-2">
	{#if isOurs}
		<span class="h-2 w-2 shrink-0 rounded-full bg-go" aria-hidden="true"></span>
	{/if}
	{#if isPlanned}
		<span class="h-2 w-2 shrink-0 rounded-full border border-dashed border-go" aria-hidden="true"></span>
	{/if}
	{productStationStateNames[state]}
</span>
