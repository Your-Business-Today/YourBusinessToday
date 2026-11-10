<script lang="ts">
	import { onMount } from 'svelte';
	import { TakeHomeCalculatorPage } from '$lib/client/takeHomeCalculatorPage.svelte';
	import { observeVisibility } from '$lib/client/visibility';
	import BiggerPictureSection from '$lib/components/taxCalculator/BiggerPictureSection.svelte';
	import CalculatorHero from '$lib/components/taxCalculator/CalculatorHero.svelte';
	import CalculatorSubNavigation from '$lib/components/taxCalculator/CalculatorSubNavigation.svelte';
	import ClosingStrip from '$lib/components/taxCalculator/ClosingStrip.svelte';
	import ComparisonsSection from '$lib/components/taxCalculator/ComparisonsSection.svelte';
	import EarningsForm from '$lib/components/taxCalculator/EarningsForm.svelte';
	import EveryPoundSection from '$lib/components/taxCalculator/EveryPoundSection.svelte';
	import HowItWorksSection from '$lib/components/taxCalculator/HowItWorksSection.svelte';
	import MobileTakeHomeBar from '$lib/components/taxCalculator/MobileTakeHomeBar.svelte';
	import SectionHeading from '$lib/components/taxCalculator/SectionHeading.svelte';
	import SelfAssessmentSection from '$lib/components/taxCalculator/SelfAssessmentSection.svelte';
	import TakeHomeEstimatePanel from '$lib/components/taxCalculator/TakeHomeEstimatePanel.svelte';
	import TakeHomePageHead from '$lib/components/taxCalculator/TakeHomePageHead.svelte';
	import TaxYearSelect from '$lib/components/taxCalculator/TaxYearSelect.svelte';
	import { rulesFor } from '$lib/data/taxCalculator/taxYearRules';

	const page = new TakeHomeCalculatorPage();
	const form = page.form;
	const estimate = $derived(form.estimate);
	const comparisons = $derived(page.comparisons);
	const bill = $derived(estimate?.selfAssessment ?? null);
	const laterStepNumber = $derived(bill ? 5 : 4);
	let takeHomePanel = $state<HTMLElement>();
	let isTakeHomePanelVisible = $state(true);

	onMount(() => page.recall());
	$effect(() => page.rememberForThisVisit());
	$effect(() => page.keepPeriodAvailable());
	$effect(() => (takeHomePanel ? observeVisibility(takeHomePanel, (isVisible) => (isTakeHomePanelVisible = isVisible)) : undefined));
</script>

<TakeHomePageHead {estimate} />
<CalculatorSubNavigation comparisonCount={comparisons.length} />

<div class="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-10 sm:px-6 md:gap-24 md:py-16">
	<CalculatorHero />
	<section id="calculator" class="flex scroll-mt-16 flex-col gap-6" aria-label="Take-home calculator">
		<SectionHeading stepNumber={1} eyebrow="Let’s start with you">
			{#snippet aside()}<TaxYearSelect bind:taxYear={form.taxYear} />{/snippet}
		</SectionHeading>
		<div class="grid grid-cols-[minmax(0,1fr)] items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
			<EarningsForm {form} />
			<TakeHomeEstimatePanel
				{estimate}
				bind:period={page.period}
				bind:element={takeHomePanel}
				onSave={() => page.saveComparison()}
				onExport={() => page.exportEstimate()}
			/>
		</div>
	</section>
	{#if estimate}
		<BiggerPictureSection {estimate} bind:extraIncome={page.extraIncome} bind:livingCosts={page.livingCosts} />
		<EveryPoundSection {estimate} period={page.period} />
		{#if bill}<SelfAssessmentSection stepNumber={4} {estimate} {bill} />{/if}
	{/if}
	<ComparisonsSection
		stepNumber={laterStepNumber}
		{comparisons}
		currentTakeHome={estimate?.takeHome ?? null}
		onLoad={(comparison) => page.loadComparison(comparison)}
		onRemove={(comparison) => page.removeComparison(comparison)}
	/>
	<HowItWorksSection stepNumber={laterStepNumber + 1} rules={rulesFor(form.taxYear)} />
	<ClosingStrip canExport={estimate !== null} onExport={() => page.exportEstimate()} />
</div>

{#if estimate}
	<MobileTakeHomeBar takeHome={estimate.takeHome} isVisible={!isTakeHomePanelVisible} />
{/if}
