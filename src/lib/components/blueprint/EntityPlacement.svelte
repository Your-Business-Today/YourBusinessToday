<script lang="ts">
	import EntityLink from './EntityLink.svelte';
	import { domainEntityKindPhrases } from '$lib/data/blueprint/domainDiagramKey';
	import { domainEntityKinds, type DomainEntity } from '$lib/data/blueprint/domainModel';

	let { entity, onSelect }: { entity: DomainEntity; onSelect: (entityName: string) => void } = $props();

	const isRoot = $derived(entity.name === entity.aggregateRootName);
	const isRecord = $derived(entity.kind === domainEntityKinds.record);
</script>

<p class="text-chalk/70">
	In {entity.contextName} ·
	{#if !isRecord}
		{domainEntityKindPhrases[entity.kind]}
	{:else if isRoot}
		kept in its own right
	{:else}
		kept as part of <EntityLink entityName={entity.aggregateRootName} {onSelect} />
	{/if}
</p>
