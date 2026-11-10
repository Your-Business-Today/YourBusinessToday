<script lang="ts">
	import type { TaxYearRules } from '$lib/data/taxCalculator/taxRuleTypes';
	import FigureSources from './FigureSources.svelte';
	import PlainEnglishExplanations from './PlainEnglishExplanations.svelte';
	import SectionHeading from './SectionHeading.svelte';

	let { stepNumber, rules }: { stepNumber: number; rules: TaxYearRules } = $props();

	const steps = [
		{ name: 'Tell us what comes in', detail: 'Salary, self-employed income, or both — yearly, monthly or weekly. Nothing leaves your browser.' },
		{ name: 'We apply this year’s rules', detail: 'Personal allowance, tax bands for where you live, National Insurance, student loans and pension relief.' },
		{ name: 'You see what you keep', detail: 'Take-home by the month, week or year, plus what the self-employed owe HMRC and when.' }
	];
</script>

<section id="how-it-works" class="flex scroll-mt-16 flex-col gap-6" aria-labelledby="how-it-works-heading">
	<SectionHeading {stepNumber} eyebrow="How it works" heading="Plain maths, no surprises." id="how-it-works-heading" />
	<ol class="grid gap-5 md:grid-cols-3">
		{#each steps as step, stepIndex (step.name)}
			<li class="flex flex-col gap-2 rounded-3xl border border-hairline p-6">
				<span class="font-mono text-sm text-signal">0{stepIndex + 1}</span>
				<h3 class="font-display text-lg font-medium">{step.name}</h3>
				<p class="text-sm text-chalk/65">{step.detail}</p>
			</li>
		{/each}
	</ol>
	<PlainEnglishExplanations {rules} />
	<FigureSources {rules} />
	<p class="max-w-3xl text-xs leading-relaxed text-chalk/50">
		An estimate for guidance only — not tax, legal or financial advice, and not connected to HMRC. Tax is worked out
		over the whole year, so month-to-month payslips can differ, especially around bonuses. It doesn’t cover limited
		companies, partnerships or landlords, dividends, savings or rental income, salary sacrifice, Marriage Allowance,
		capital allowances, trading-loss relief against other income or voluntary National Insurance for time abroad. For
		your own situation, speak to an accountant.
	</p>
</section>
