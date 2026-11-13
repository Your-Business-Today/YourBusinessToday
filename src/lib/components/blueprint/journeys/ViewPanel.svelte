<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import RaiseChangeButton from '$lib/components/blueprint/RaiseChangeButton.svelte';
	import ScreenTools from '$lib/components/blueprint/ScreenTools.svelte';
	import ViewJourneys from './ViewJourneys.svelte';
	import Wireframe from '$lib/components/blueprint/Wireframe.svelte';
	import { changeSubjectKinds } from '$lib/data/blueprint/changeSubject';
	import { journeySiteMapMessages } from './journeySiteMapWords';
	import { screenAtRoute, type SiteMap } from '$lib/data/blueprint/siteMap';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { JourneyMap, MapView } from '$lib/data/journeyMap/journeyMap';
	import type { LineColour } from '$lib/components/lineMap/layout/lineMapModel';
	import type { McpMap } from '$lib/data/blueprint/mcpMap';

	let {
		view,
		journeyMap,
		colours,
		siteMap,
		mcpMap,
		goals
	}: {
		view: MapView;
		journeyMap: JourneyMap;
		colours: Map<string, LineColour>;
		siteMap: SiteMap | null;
		mcpMap: McpMap | null;
		goals: Goal[];
	} = $props();

	const screen = $derived(siteMap === null ? undefined : screenAtRoute(siteMap, view.route));
</script>

<DashboardPanel id="view-panel" title={view.name}>
	{#snippet actions()}
		<RaiseChangeButton subject={{ kind: changeSubjectKinds.screen, name: view.route }} {goals} />
	{/snippet}
	<div class="grid gap-4 px-4 py-4 text-sm md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
		<div class="self-start overflow-hidden rounded-lg border border-hairline bg-night/60">
			{#if screen === undefined}
				<p class="p-4 text-xs text-chalk-subtle">{journeySiteMapMessages.noWireframe}</p>
			{:else}
				<Wireframe layout={screen.layout} />
			{/if}
		</div>
		<div class="flex min-w-0 flex-col gap-3">
			<code class="font-mono text-xs text-chalk/70">{view.route}</code>
			<p class="text-chalk/80">{view.purpose}</p>
			{#if view.shows !== null}
				<p class="text-chalk/70">Shows <span class="text-chalk">{view.shows}</span>.</p>
			{/if}
			<ViewJourneys {journeyMap} route={view.route} {colours} />
			{#if mcpMap !== null}
				<ScreenTools {mcpMap} route={view.route} />
			{/if}
		</div>
	</div>
</DashboardPanel>
