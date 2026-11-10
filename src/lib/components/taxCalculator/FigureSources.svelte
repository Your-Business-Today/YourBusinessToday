<script lang="ts">
	import type { TaxYearRules } from '$lib/data/taxCalculator/taxRuleTypes';
	import { formatLongDate } from '$lib/data/taxCalculator/taxDates';
	import { marginalReliefFormulaSourceUrl } from '$lib/data/taxCalculator/companyRules';
	import { paymentsOnAccountRules, pensionReliefSourceUrl, tradingAllowanceRules } from '$lib/data/taxCalculator/sharedRules';

	let { rules }: { rules: TaxYearRules } = $props();

	const { incomeTax, nationalInsurance, studentLoans, mileage, homeWorking, makingTaxDigital } = $derived(rules);
	const { corporationTax, dividends, employerNationalInsurance } = $derived(rules);
	const sources = $derived([
		{ topic: 'Income tax bands, including Scotland', url: incomeTax.sourceUrl },
		{ topic: 'National Insurance: Class 1, 2 and 4', url: nationalInsurance.sourceUrl },
		{ topic: 'Student and postgraduate loan thresholds', url: studentLoans.sourceUrl },
		{ topic: 'Pension tax relief', url: pensionReliefSourceUrl },
		{ topic: 'Mileage rates', url: mileage.sourceUrl },
		{ topic: 'Working from home flat rates', url: homeWorking.sourceUrl },
		{ topic: 'Making Tax Digital thresholds', url: makingTaxDigital.sourceUrl },
		{ topic: 'Trading allowance', url: tradingAllowanceRules.sourceUrl },
		{ topic: 'Payments on account', url: paymentsOnAccountRules.sourceUrl },
		{ topic: 'Corporation tax rates and limits', url: corporationTax.sourceUrl },
		{ topic: 'Corporation tax marginal relief', url: marginalReliefFormulaSourceUrl },
		{ topic: 'Dividend allowance and rates', url: dividends.sourceUrl },
		{ topic: 'Employer National Insurance', url: employerNationalInsurance.sourceUrl }
	]);
</script>

<div class="flex flex-col gap-4 rounded-3xl border border-hairline bg-carriage p-6 sm:p-7">
	<h3 class="font-display text-xl font-medium">Where the figures come from</h3>
	<p class="text-sm text-chalk/60">Every rate for {rules.taxYear} was checked against gov.uk on {formatLongDate(rules.verifiedOn)}.</p>
	<ul class="grid gap-2 text-sm sm:grid-cols-2">
		{#each sources as source (source.topic)}
			<li>
				<a href={source.url} target="_blank" rel="noopener" class="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-hairline px-4 py-2 text-chalk/80 transition hover:border-go hover:text-go">
					{source.topic} <span aria-hidden="true">↗</span>
				</a>
			</li>
		{/each}
	</ul>
</div>
