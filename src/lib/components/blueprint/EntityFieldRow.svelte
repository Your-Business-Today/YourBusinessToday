<script lang="ts">
	import EntityLink from './EntityLink.svelte';
	import type { DomainField } from '$lib/data/blueprint/domainModel';

	let { field, onSelect }: { field: DomainField; onSelect: (entityName: string) => void } = $props();

	const requiredMark = $derived(field.isRequired ? ' *' : '');
</script>

<li class="flex flex-col gap-0.5 px-3 py-1.5">
	<div class="flex items-baseline justify-between gap-2">
		<span class="text-chalk/90">{field.label}{requiredMark}</span>
		{#if field.referencedEntityName === null}
			<span class="text-xs text-chalk/50">{field.type}</span>
		{:else}
			<EntityLink entityName={field.referencedEntityName} label={`→ ${field.referencedEntityName}`} {onSelect} />
		{/if}
	</div>
	{#if field.notes !== ''}
		<p class="line-clamp-2 text-xs text-chalk/50" title={field.notes}>{field.notes}</p>
	{/if}
</li>
