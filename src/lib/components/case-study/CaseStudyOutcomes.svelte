<script lang="ts">
	import type { CaseStudyOutcome } from '$lib/data/caseStudies';

	let { outcomes }: { outcomes: CaseStudyOutcome[] } = $props();
</script>

<dl class="grid grid-cols-2 gap-6 border-t border-hairline pt-6 md:grid-cols-4">
	{#each outcomes as outcome (outcome.headline)}
		<div class="flex flex-col gap-1">
			<dt class="font-display text-xl font-medium md:text-2xl">{outcome.headline}</dt>
			<dd class="text-sm text-chalk/60">{outcome.detail}</dd>
		</div>
	{/each}
</dl>
