<script lang="ts">
	import DomainDiagramKey from './DomainDiagramKey.svelte';
	import DomainMap from './DomainMap.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import EntityPanel from './EntityPanel.svelte';
	import { dashboardGridClasses } from '$lib/components/workspace/workspaceStyles';
	import { entitiesOf, type DomainModel } from '$lib/data/blueprint/domainModel';
	import type { Goal } from '$lib/server/goals/goalRecord';
	import type { SiteMap } from '$lib/data/blueprint/siteMap';

	let {
		domain,
		siteMap,
		projectId,
		goals,
		linkedEntityName
	}: { domain: DomainModel; siteMap: SiteMap | null; projectId: string | null; goals: Goal[]; linkedEntityName: string | null } =
		$props();

	let selectedEntityName = $state<string | null>(null);

	const chosenName = $derived(selectedEntityName ?? linkedEntityName);
	const chosenEntity = $derived(entitiesOf(domain).find((entity) => entity.name === chosenName));

	function select(entityName: string) {
		selectedEntityName = entityName;
	}
</script>

<p class="text-sm text-chalk/60">
	Each box is an area of the business; ◆ marks a record kept in its own right, with the things kept as part of it
	beneath, and a dashed outline gathers a group's members. Pick a thing to see its fields and what it holds, refers to and marks.
</p>
<DomainDiagramKey />
<div class={dashboardGridClasses}>
	<DomainMap {domain} selectedEntityName={chosenName} onSelect={select} />
	<aside class="flex min-w-0 flex-col gap-4">
		{#if chosenEntity === undefined}
			<EmptyState message="Pick a thing on the map." />
		{:else}
			<EntityPanel entity={chosenEntity} {domain} {siteMap} {projectId} {goals} onSelect={select} />
		{/if}
	</aside>
</div>
