<script lang="ts">
	import OptionalClauseCard from './OptionalClauseCard.svelte';
	import type { OptionalClauseReading } from '$lib/data/optionalClauseReading';

	let { clauses }: { clauses: OptionalClauseReading[] } = $props();
</script>

{#if clauses.length > 0}
	<section class="flex flex-col gap-6 border-t border-hairline pt-8 print:hidden">
		<h2 class="font-display text-xl text-chalk">Optional clauses</h2>
		<p class="text-sm text-chalk/60">Kept apart from the standard text and chosen for each client’s pack.</p>
		{#each clauses as clause (clause.slug)}
			<OptionalClauseCard {clause} />
		{/each}
	</section>
{/if}
