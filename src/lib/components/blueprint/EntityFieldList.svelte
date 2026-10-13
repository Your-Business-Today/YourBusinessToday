<script lang="ts">
	import EntityFieldRow from './EntityFieldRow.svelte';
	import type { DomainField } from '$lib/data/blueprint/domainModel';

	let { fields, onSelect }: { fields: DomainField[]; onSelect: (entityName: string) => void } = $props();
</script>

<section class="flex flex-col gap-1.5">
	<h3 class="font-display text-xs tracking-widest text-chalk/50 uppercase">Fields</h3>
	<ul class="flex flex-col divide-y divide-hairline rounded-lg border border-hairline">
		{#each fields as field (field.name)}
			<EntityFieldRow {field} {onSelect} />
		{/each}
	</ul>
</section>
