<script lang="ts">
	import EntityLink from '$lib/components/blueprint/EntityLink.svelte';
	import type { ContextPart } from '$lib/data/companyContext/companyContext';

	let {
		heading,
		parts,
		onSelect
	}: { heading: string; parts: ContextPart[]; onSelect: (partKey: string) => void } = $props();
</script>

{#if parts.length > 0}
	<section class="flex flex-col gap-1.5">
		<h3 class="font-display text-xs tracking-widest text-chalk/50 uppercase">{heading}</h3>
		<ul class="flex flex-col gap-1 text-chalk/70">
			{#each parts as part (part.key)}
				<li><EntityLink entityName={part.key} label={part.name} {onSelect} /></li>
			{/each}
		</ul>
	</section>
{/if}
