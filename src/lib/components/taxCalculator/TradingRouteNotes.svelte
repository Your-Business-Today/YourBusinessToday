<script lang="ts">
	import { singleDirectorEmploymentAllowanceSourceUrl } from '$lib/data/taxCalculator/companyRules';
	import DisclosureMarker from './DisclosureMarker.svelte';
	import { disclosureSummaryClasses } from './calculatorStyles';

	const assumptions = [
		'As employed, the whole amount is your salary. Your employer pays its own National Insurance on top.',
		'As a sole trader, the whole amount is your profit, after any business costs.',
		'Through a company, every pound of profit after corporation tax is paid out as dividends in the same tax year.',
		'One company with no associated companies, and a 12-month accounting period.',
		'Pension and student loan repayments are left out of all three.'
	];
</script>

<p class="rounded-2xl border border-caution/30 bg-caution/5 px-4 py-3 text-sm text-chalk/75">
	The Employment Allowance does not apply where the director is the only employee, so the company pays its employer
	National Insurance in full.
	<a href={singleDirectorEmploymentAllowanceSourceUrl} target="_blank" rel="noopener" class="text-go underline-offset-4 hover:underline">
		HMRC’s guidance ↗
	</a>
</p>
<details class="group border-t border-hairline pt-4 text-sm">
	<summary class={disclosureSummaryClasses}>What this comparison assumes <DisclosureMarker /></summary>
	<ul class="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-chalk/70">
		{#each assumptions as assumption (assumption)}<li>{assumption}</li>{/each}
	</ul>
</details>
