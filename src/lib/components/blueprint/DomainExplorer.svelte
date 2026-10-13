<script lang="ts">
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
	}: { domain: DomainModel; siteMap: SiteMap | null; projectId: string; goals: Goal[]; linkedEntityName: string | null } =
		$props();

	let selectedEntityName = $state<string | null>(null);

	const chosenName = $derived(selectedEntityName ?? linkedEntityName);
	const chosenEntity = $derived(entitiesOf(domain).find((entity) => entity.name === chosenName));

	function select(entityName: string) {
		selectedEntityName = entityName;
	}
</script>

<p class="text-sm text-chalk/60">
	Each box is a bounded context; ◆ marks an aggregate's root, with the entities inside it beneath. Pick an entity to
	see its fields, what it holds and refers to, and its screens.
</p>
<div class={dashboardGridClasses}>
	<DomainMap {domain} selectedEntityName={chosenName} onSelect={select} />
	<aside class="flex min-w-0 flex-col gap-4">
		{#if chosenEntity === undefined}
			<EmptyState message="Pick an entity on the map." />
		{:else}
			<EntityPanel entity={chosenEntity} {domain} {siteMap} {projectId} {goals} onSelect={select} />
		{/if}
	</aside>
</div>
