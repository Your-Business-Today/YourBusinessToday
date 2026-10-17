<script lang="ts">
	import { branchWebAddress } from '$lib/data/branchName';
	import { formatBritishDateTime } from '$lib/data/britishDate';
	import { lifecycleOutcomeLabels, lifecycleStepLabels } from '$lib/data/lifecycleStep';
	import type { LifecycleStep } from '$lib/server/lifecycle/lifecycleStepRecord';

	let { step, repositoryUrl }: { step: LifecycleStep; repositoryUrl: string } = $props();

	const outcome = $derived(lifecycleOutcomeLabels[step.outcome]);
	const branchAddress = $derived(branchWebAddress(repositoryUrl, step.branchName));
	const linkClasses = 'truncate font-display text-xs text-go hover:brightness-110';
</script>

<li class="flex flex-col gap-1 border-l border-hairline pl-3">
	<div class="flex flex-wrap items-baseline gap-x-2">
		<span class="font-display text-sm text-chalk">{lifecycleStepLabels[step.step]}</span>
		{#if outcome !== ''}
			<span class="text-xs text-caution">{outcome}</span>
		{/if}
		<time datetime={step.createdAt} class="ml-auto text-xs text-chalk/50">
			{formatBritishDateTime(step.createdAt)}
		</time>
	</div>
	<p class="text-xs text-chalk/60">
		{step.agent}{step.model === '' ? '' : ` · ${step.model}`}
	</p>
	{#if step.note !== ''}
		<p class="text-sm text-chalk/80">{step.note}</p>
	{/if}
	<div class="flex flex-wrap gap-x-3">
		{#if branchAddress !== null}
			<a href={branchAddress} target="_blank" rel="noopener" class={linkClasses}>⎇ {step.branchName} ↗</a>
		{/if}
		{#if step.runUrl !== ''}
			<a href={step.runUrl} target="_blank" rel="noopener" class={linkClasses}>Where it ran ↗</a>
		{/if}
	</div>
</li>
