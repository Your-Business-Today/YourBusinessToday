<script lang="ts">
	import CopyTextButton from '$lib/components/site/CopyTextButton.svelte';
	import { connectSteps } from '$lib/data/demo/demoPage';
	import type { DemoBusiness } from '$lib/data/demo/demoBusiness';

	let {
		business,
		connectorUrl,
		demoUrl
	}: { business: DemoBusiness; connectorUrl: string; demoUrl: string } = $props();
</script>

<section class="mx-auto max-w-6xl px-6 py-20 md:py-24">
	<p class="font-display text-sm tracking-widest text-signal uppercase">Your private demo</p>
	<h1 class="mt-5 max-w-3xl font-display text-4xl leading-tight font-medium md:text-5xl">
		{business.name}
	</h1>
	<p class="mt-4 max-w-prose text-lg text-chalk/70">
		{business.trade}, in {business.town}. This copy is yours alone: connect your Claude to it,
		ask it anything and let it act. Keep this page's address to come back to the same copy.
	</p>
	<div class="mt-10 flex flex-col gap-3 rounded-2xl border border-hairline p-5">
		<span class="font-display text-xs tracking-widest text-chalk/50 uppercase">
			The link your Claude connects to
		</span>
		<div class="flex flex-wrap items-center gap-3">
			<code class="break-all rounded-xl border border-hairline bg-night px-4 py-2.5 text-sm text-chalk">
				{connectorUrl}
			</code>
			<CopyTextButton text={connectorUrl} label="Copy the link" />
		</div>
		<p class="text-sm text-chalk/60">
			This page is at <a href={demoUrl} class="text-chalk underline">{demoUrl}</a>.
		</p>
	</div>
	<div class="mt-8 border-t border-hairline">
		{#each connectSteps as step (step.where)}
			<div class="grid gap-2 border-b border-hairline py-6 md:grid-cols-[16rem_1fr] md:gap-10">
				<h3 class="font-display text-lg font-medium">{step.where}</h3>
				<p class="max-w-prose text-chalk/70">{step.how}</p>
			</div>
		{/each}
	</div>
</section>
