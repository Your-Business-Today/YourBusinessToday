<script lang="ts">
	import LeadQuoteLinesTable from './LeadQuoteLinesTable.svelte';
	import LeadQuoteTotals from './LeadQuoteTotals.svelte';
	import { quoteDatesWords } from './leadQuoteWords';
	import type { LeadQuote } from '$lib/data/leadQuoteRules';

	let { companyName, quote }: { companyName: string; quote: LeadQuote } = $props();
</script>

<article class="flex flex-col gap-6">
	<header class="flex flex-col gap-1">
		<p class="text-sm text-chalk-subtle">For {companyName}</p>
		<h2 class="font-display text-2xl">{quote.title}</h2>
		<p class="text-sm text-chalk-subtle">{quoteDatesWords(quote)}</p>
	</header>
	{#if quote.introduction !== ''}
		<p class="max-w-prose whitespace-pre-line">{quote.introduction}</p>
	{/if}
	<LeadQuoteLinesTable lines={quote.lines} />
	<LeadQuoteTotals lines={quote.lines} />
	{#if quote.terms !== ''}
		<section class="flex flex-col gap-2">
			<h3 class="font-display text-lg">Terms</h3>
			<p class="max-w-prose text-sm whitespace-pre-line text-chalk-muted">{quote.terms}</p>
		</section>
	{/if}
</article>
