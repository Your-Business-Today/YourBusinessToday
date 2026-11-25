<script lang="ts">
	import DocumentProse from './DocumentProse.svelte';
	import type { OptionalClauseReading } from '$lib/data/optionalClauseReading';

	let { clauses }: { clauses: OptionalClauseReading[] } = $props();
</script>

{#if clauses.length > 0}
	<section class="flex flex-col gap-6 border-t border-hairline pt-8 print:hidden">
		<div class="flex flex-col gap-1">
			<h2 class="font-display text-xl text-chalk">Optional clauses</h2>
			<p class="text-sm text-chalk/60">Kept apart from the standard text and chosen for each client’s pack.</p>
		</div>
		{#each clauses as clause (clause.slug)}
			<article class="flex flex-col gap-3">
				<h3 class="font-display text-base text-chalk">
					{clause.title}
					<span class="text-xs text-chalk/50">
						{clause.isChosenByDefault ? 'chosen unless left out' : 'left out unless chosen'}
					</span>
				</h3>
				<p class="text-sm text-chalk/60">{clause.summary}</p>
				<DocumentProse documentHtml={clause.clauseHtml} />
			</article>
		{/each}
	</section>
{/if}
