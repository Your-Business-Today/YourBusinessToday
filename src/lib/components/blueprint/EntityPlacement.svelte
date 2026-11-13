<script lang="ts">
	import EntityLink from './EntityLink.svelte';
	import type { DomainEntity } from '$lib/data/blueprint/domainModel';

	let { entity, onSelect }: { entity: DomainEntity; onSelect: (entityName: string) => void } = $props();

	const isRoot = $derived(entity.name === entity.aggregateRootName);
</script>

<p class="text-chalk/70">
	In {entity.contextName} ·
	{#if isRoot}
		kept in its own right
	{:else}
		kept as part of <EntityLink entityName={entity.aggregateRootName} {onSelect} />
	{/if}
</p>
