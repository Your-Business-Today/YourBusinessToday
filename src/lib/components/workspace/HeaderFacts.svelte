<script lang="ts">
	import HeaderFact from './HeaderFact.svelte';

	type Fact = { label: string; href?: string };

	let { facts }: { facts: Fact[] } = $props();
</script>

{#if facts.length > 0}
	<ul class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-chalk/60">
		{#each facts as fact (fact.label)}
			<HeaderFact {fact} />
		{/each}
	</ul>
{/if}
