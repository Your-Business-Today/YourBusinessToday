<script lang="ts">
	import PageMeta from '$lib/components/site/PageMeta.svelte';
	import { taxCalculatorPath } from '$lib/data/taxCalculator/taxCalculatorPath';
	import { monthsPerYear } from '$lib/data/taxCalculator/resultPeriods';
	import type { TakeHomeEstimate } from '$lib/data/taxCalculator/takeHomeEstimate';
	import { formatMoney } from '$lib/data/taxCalculator/taxCalculatorFormatting';

	let { estimate }: { estimate: TakeHomeEstimate | null } = $props();

	const pageTitle = 'Take-home pay and tax calculator | Your Business Today';
	const pageDescription =
		'Free UK take-home calculator for employees, sole traders and CIS subcontractors. See what you keep after income tax, National Insurance, student loans and pension — and what to put aside for Self Assessment.';
	const announcement = $derived(estimate ? `You keep ${formatMoney(estimate.takeHome / monthsPerYear)} a month` : '');
</script>

<PageMeta title={pageTitle} description={pageDescription} path={taxCalculatorPath} />

<noscript>
	<p class="mx-4 mt-4 rounded-xl border border-caution/40 p-4 text-sm">This calculator needs JavaScript switched on.</p>
</noscript>
<p class="sr-only" aria-live="polite">{announcement}</p>
