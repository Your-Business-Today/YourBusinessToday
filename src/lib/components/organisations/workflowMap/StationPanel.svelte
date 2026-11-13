<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import StationColumn from './StationColumn.svelte';
	import StationDomainColumn from './StationDomainColumn.svelte';
	import StationFlowItem from './StationFlowItem.svelte';
	import StationPlaceLine from './StationPlaceLine.svelte';
	import { lineSwatchClasses } from './lineSwatchClasses';
	import type { StationDetails } from './stationDetails';
	import type { StationDomain } from '$lib/data/domainReading';

	let { details, stationDomain, organisationId }: { details: StationDetails; stationDomain: StationDomain; organisationId: string | null } = $props();

	const { lineName, lineColour, name, summary, inputs, outputs, place, things } = $derived(details);

	const columnTitles = { takesIn: 'Takes in', produces: 'Produces', doneIn: 'Done in', domain: 'In the domain' };
	const nothingFiled = 'Nothing filed';
	const emptyClasses = 'text-sm text-chalk-faint';
</script>

<DashboardPanel id="station-panel">
	<div class="grid grid-cols-1 gap-px bg-hairline md:grid-cols-2 xl:grid-cols-[1.4fr_1.3fr_1fr_1fr_1.1fr]">
		<section class="flex flex-col gap-2 bg-carriage p-5 md:col-span-2 xl:col-span-1">
			<span class="flex items-center gap-2 text-sm text-chalk-subtle">
				<span class="h-1.5 w-3 rounded-full {lineSwatchClasses[lineColour]}" aria-hidden="true"></span>
				{lineName}
			</span>
			<h2 class="font-display text-xl font-semibold text-chalk">{name}</h2>
			<p class="text-chalk-muted">{summary}</p>
		</section>
		<StationColumn title={columnTitles.takesIn}>
			{#if inputs.length === 0}
				<p class={emptyClasses}>{nothingFiled}</p>
			{/if}
			<ul class="flex flex-col gap-3">
				{#each inputs as input (input.item)}
					<StationFlowItem item={input.item} note={input.source} goesWrong={input.goesWrong} />
				{/each}
			</ul>
		</StationColumn>
		<StationColumn title={columnTitles.produces}>
			{#if outputs.length === 0}
				<p class={emptyClasses}>{nothingFiled}</p>
			{/if}
			<ul class="flex flex-col gap-3">
				{#each outputs as output (output.item)}
					<StationFlowItem item={output.item} note={output.destination} />
				{/each}
			</ul>
		</StationColumn>
		<StationColumn title={columnTitles.doneIn}>
			<StationPlaceLine place={place} />
		</StationColumn>
		<StationColumn title={columnTitles.domain}>
			{#if things.length === 0}
				<p class={emptyClasses}>{nothingFiled}</p>
			{/if}
			<StationDomainColumn {things} {stationDomain} {organisationId} />
		</StationColumn>
	</div>
</DashboardPanel>
