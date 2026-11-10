<script lang="ts">
	import EntityLink from '$lib/components/blueprint/EntityLink.svelte';
	import type { CompanyContextVersion, ProcessStep } from '$lib/data/companyContext/companyContext';

	let {
		steps,
		context,
		onSelect
	}: { steps: ProcessStep[]; context: CompanyContextVersion; onSelect: (partKey: string) => void } = $props();

	const partNames = $derived(new Map(context.parts.map((part) => [part.key, part.name])));
</script>

<section class="flex flex-col gap-1.5">
	<h3 class="font-display text-xs tracking-widest text-chalk/50 uppercase">Steps</h3>
	<ol class="flex list-decimal flex-col gap-1 pl-5 text-chalk/70">
		{#each steps as step (step.position)}
			<li>
				{step.description}
				{#if step.roleKey !== null}
					(<EntityLink entityName={step.roleKey} label={partNames.get(step.roleKey) ?? step.roleKey} {onSelect} />)
				{/if}
			</li>
		{/each}
	</ol>
</section>
