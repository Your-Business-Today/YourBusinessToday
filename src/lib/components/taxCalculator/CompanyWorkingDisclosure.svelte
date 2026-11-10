<script lang="ts">
	import { companyWorkingRows } from '$lib/data/taxCalculator/companyWorkingRows';
	import type { LimitedCompanyRoute } from '$lib/data/taxCalculator/limitedCompanyRoute';
	import type { TaxYearRules } from '$lib/data/taxCalculator/taxRuleTypes';
	import BreakdownTable from './BreakdownTable.svelte';
	import DisclosureMarker from './DisclosureMarker.svelte';
	import { disclosureSummaryClasses } from './calculatorStyles';

	let { company, rules }: { company: LimitedCompanyRoute; rules: TaxYearRules } = $props();

	const corporationTax = $derived(rules.corporationTax);
</script>

<details class="group border-t border-hairline pt-4 text-sm">
	<summary class={disclosureSummaryClasses}>Show how the company figure is worked out <DisclosureMarker /></summary>
	<div class="mt-3">
		<BreakdownTable rows={companyWorkingRows(company, corporationTax)} label="The limited company, worked out for the year" />
	</div>
</details>
