<script lang="ts">
	import type { ClaudePlanSteps } from '$lib/portal/connectingClaude';

	let { planSteps }: { planSteps: ClaudePlanSteps } = $props();
</script>

<li class="flex flex-col gap-2 px-4 py-4">
	<p class="font-display text-chalk">{planSteps.plans}</p>
	<ol class="flex list-decimal flex-col gap-1 pl-5 text-sm text-chalk/80">
		{#each planSteps.steps as step (step)}
			<li>{step}</li>
		{/each}
	</ol>
</li>
