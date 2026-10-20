<script lang="ts">
	import { pounds } from '$lib/data/demo/demoMoney';
	import type { MoneyFinding } from '$lib/data/demo/moneyAndOpportunity';

	let { findings }: { findings: MoneyFinding[] } = $props();

	const total = $derived(findings.reduce((sum, finding) => sum + finding.figure, 0));
</script>

<section class="mx-auto max-w-6xl px-6 py-20 md:py-24">
	<p class="font-display text-sm tracking-widest text-signal uppercase">Money and opportunity</p>
	<h2 class="mt-5 max-w-3xl font-display text-3xl leading-tight font-medium">
		{#if findings.length === 0}
			Nothing is leaking. Every job is invoiced, nothing is overdue, every quote is followed up.
		{:else}
			{pounds(total)} is leaking or waiting, right now.
		{/if}
	</h2>
	<p class="mt-4 max-w-prose text-chalk/70">
		This is what Claude finds when you ask where the money is. Each one names the tool that puts
		it right, and the figures here change as your Claude acts.
	</p>
	<div class="mt-8 grid gap-6 md:grid-cols-2">
		{#each findings as finding (finding.title)}
			<div class="flex flex-col gap-2 rounded-2xl border border-hairline p-5">
				<span class="font-display text-3xl font-medium text-signal">{pounds(finding.figure)}</span>
				<h3 class="font-display text-lg font-medium">{finding.title}</h3>
				<p class="text-sm text-chalk/70">{finding.sentence}</p>
				<p class="text-xs text-chalk/50">Ask Claude to put it right; it uses {finding.fixWith}.</p>
			</div>
		{/each}
	</div>
</section>
