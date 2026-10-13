<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import EntityFieldList from './EntityFieldList.svelte';
	import EntityPlacement from './EntityPlacement.svelte';
	import EntityRelationshipList from './EntityRelationshipList.svelte';
	import EntityScreenLinks from './EntityScreenLinks.svelte';
	import RaiseChangeButton from './RaiseChangeButton.svelte';
	import { changeSubjectKinds } from '$lib/data/blueprint/changeSubject';
	import { relationshipsTouching, type DomainEntity, type DomainModel } from '$lib/data/blueprint/domainModel';
	import { screensOfEntity, type SiteMap } from '$lib/data/blueprint/siteMap';
	import type { Goal } from '$lib/server/goals/goalRecord';

	let {
		entity,
		domain,
		siteMap,
		projectId,
		goals,
		onSelect
	}: {
		entity: DomainEntity;
		domain: DomainModel;
		siteMap: SiteMap | null;
		projectId: string;
		goals: Goal[];
		onSelect: (entityName: string) => void;
	} = $props();

	const statuses = $derived(entity.statuses);
	const relationships = $derived(relationshipsTouching(domain, entity.name));
	const screens = $derived(siteMap === null ? [] : screensOfEntity(siteMap, entity.name));
</script>

<DashboardPanel title={entity.title}>
	{#snippet actions()}
		<RaiseChangeButton subject={{ kind: changeSubjectKinds.entity, name: entity.name }} {goals} />
	{/snippet}
	<div class="flex flex-col gap-4 px-4 py-4 text-sm">
		<EntityPlacement {entity} {onSelect} />
		{#if statuses.length > 0}
			<ul class="flex flex-wrap gap-1.5" aria-label="Statuses">
				{#each statuses as status (status)}
					<li class="rounded-full bg-night px-2 py-0.5 text-xs text-chalk/70">{status}</li>
				{/each}
			</ul>
		{/if}
		{#if entity.notes !== ''}
			<p class="text-chalk/60">{entity.notes}</p>
		{/if}
		<EntityFieldList fields={entity.fields} {onSelect} />
		{#if relationships.length > 0}
			<EntityRelationshipList entityName={entity.name} {relationships} {onSelect} />
		{/if}
		{#if screens.length > 0}
			<EntityScreenLinks {screens} {projectId} />
		{/if}
	</div>
</DashboardPanel>
