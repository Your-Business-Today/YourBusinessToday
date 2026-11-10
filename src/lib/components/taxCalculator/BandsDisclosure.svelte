<script lang="ts">
	import type { BreakdownScale } from '$lib/data/taxCalculator/breakdownRow';
	import { incomeTaxBandRows } from '$lib/data/taxCalculator/incomeTaxBandRows';
	import { nationalInsuranceRows } from '$lib/data/taxCalculator/nationalInsuranceRows';
	import type { TakeHomeEstimate } from '$lib/data/taxCalculator/takeHomeEstimate';
	import BreakdownTable from './BreakdownTable.svelte';
	import DisclosureMarker from './DisclosureMarker.svelte';
	import { disclosureSummaryClasses } from './calculatorStyles';

	let { estimate, scale }: { estimate: TakeHomeEstimate; scale: BreakdownScale } = $props();

	const nationalInsurance = $derived(nationalInsuranceRows(estimate, scale));
</script>

<details class="group border-t border-hairline pt-4 text-sm">
	<summary class={disclosureSummaryClasses}>Show tax and National Insurance bands <DisclosureMarker /></summary>
	<div class="mt-3 flex flex-col gap-4">
		<BreakdownTable rows={incomeTaxBandRows(estimate, scale)} label="Income tax by band" />
		{#if nationalInsurance.length > 0}
			<BreakdownTable rows={nationalInsurance} label="National Insurance by rate" />
		{/if}
	</div>
</details>
