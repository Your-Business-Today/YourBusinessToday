<script lang="ts">
	import { formatPoundsAndPence } from '$lib/data/books/money';
	import { totalsOfQuote } from '$lib/data/leadQuoteTotals';
	import { feeWords, leadQuoteTotalLabels } from './leadQuoteWords';
	import type { LeadQuoteLine } from '$lib/data/leadQuoteRules';

	let { lines }: { lines: LeadQuoteLine[] } = $props();

	const totals = $derived(totalsOfQuote(lines));
</script>

<dl class="grid gap-3 sm:grid-cols-3">
	<div class="flex flex-col gap-1">
		<dt class="text-xs tracking-wide text-chalk-subtle uppercase">{leadQuoteTotalLabels.toBuild}</dt>
		<dd class="font-display text-xl">{formatPoundsAndPence(totals.toBuild)}</dd>
	</div>
	<div class="flex flex-col gap-1">
		<dt class="text-xs tracking-wide text-chalk-subtle uppercase">{leadQuoteTotalLabels.eachMonth}</dt>
		<dd class="font-display text-xl">{formatPoundsAndPence(totals.eachMonth)}</dd>
	</div>
	{#if totals.dayRates.length > 0}
		<div class="flex flex-col gap-1">
			<dt class="text-xs tracking-wide text-chalk-subtle uppercase">{leadQuoteTotalLabels.dayRates}</dt>
			{#each totals.dayRates as line, index (index)}
				<dd class="text-sm">{line.name}: {feeWords(line)}</dd>
			{/each}
		</div>
	{/if}
</dl>
