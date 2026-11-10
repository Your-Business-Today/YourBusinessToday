<script lang="ts">
	import type { TaxCalculatorForm } from '$lib/client/taxCalculatorForm.svelte';
	import { tradingAllowanceRules } from '$lib/data/taxCalculator/sharedRules';
	import { earningTypes } from '$lib/data/taxCalculator/takeHomeInputs';
	import { formatMoney, formatWholePounds } from '$lib/data/taxCalculator/taxCalculatorFormatting';
	import BigAmountField from './BigAmountField.svelte';
	import ExpenseExamples from './ExpenseExamples.svelte';
	import PeriodAmountField from './PeriodAmountField.svelte';
	import ToggleSwitch from './ToggleSwitch.svelte';

	let { form }: { form: TaxCalculatorForm } = $props();

	const incomeHelp = 'Money actually paid to you for your self-employed work — not what you have invoiced.';
	const sliderMaximum = 150000;
	const expensesHelp = `Anything wholly and exclusively for the business. Mileage and working from home go under “Make it more accurate”. Under ${formatWholePounds(tradingAllowanceRules.allowance)} in total? We use the tax-free trading allowance instead.`;
	let isCisSubcontractor = $derived(form.tradingStatus === 'cisSubcontractor');
</script>

<div class="flex flex-col gap-5">
	{#if form.earningType === earningTypes.selfEmployed}
		<BigAmountField
			id="self-employment-income"
			label="What does your business take in?"
			helperText={incomeHelp}
			suffix="before expenses"
			periodAmount={form.selfEmploymentIncome}
			{sliderMaximum}
		/>
	{:else}
		<PeriodAmountField id="self-employment-income" label="Self-employed income" helperText={incomeHelp} periodAmount={form.selfEmploymentIncome} formatAnnual={formatMoney} />
	{/if}
	<PeriodAmountField
		id="expenses"
		label="Business expenses"
		helperText={expensesHelp}
		periodAmount={form.expenses}
		formatAnnual={formatMoney}
	/>
	<ExpenseExamples />
	<ToggleSwitch
		label="I work under CIS"
		description="Contractors take CIS off your labour (not materials) before paying you. If only some of your work is CIS, switch this on."
		isOn={isCisSubcontractor}
		onToggle={(isOn) => (form.tradingStatus = isOn ? 'cisSubcontractor' : 'soleTrader')}
	/>
	{#if isCisSubcontractor}
		<PeriodAmountField
			id="cis-deductions"
			label="CIS deducted from your payments"
			helperText="The total on your deduction statements: normally 20% of labour if you’re registered, 30% if not, and nothing with gross payment status."
			periodAmount={form.cisDeductions}
			formatAnnual={formatMoney}
		/>
	{/if}
</div>
