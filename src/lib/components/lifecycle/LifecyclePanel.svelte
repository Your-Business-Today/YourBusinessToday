<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import LifecycleStepItem from './LifecycleStepItem.svelte';
	import { claimPhrase, standingClaim } from '$lib/data/lifecycleClaim';
	import type { LifecycleStep } from '$lib/server/lifecycle/lifecycleStepRecord';

	let { steps, repositoryUrl }: { steps: LifecycleStep[]; repositoryUrl: string } = $props();

	const claim = $derived(standingClaim(steps, new Date()));
	const newestFirst = $derived([...steps].reverse());
</script>

<DashboardPanel title="Lifecycle">
	<div class="flex flex-col gap-3 px-4 py-3">
		{#if steps.length === 0}
			<p class="text-sm text-chalk/60">No AI has taken a step on this yet.</p>
		{:else}
			<p class="text-sm" class:text-go={claim !== null} class:text-chalk={claim === null}>
				{claim === null ? 'Nobody holds this now.' : `${claimPhrase(claim)}.`}
			</p>
			<ol class="flex flex-col gap-3">
				{#each newestFirst as step (step.id)}
					<LifecycleStepItem {step} {repositoryUrl} />
				{/each}
			</ol>
		{/if}
	</div>
</DashboardPanel>
