<script lang="ts">
	import CaseStudyFigures from '../case-study/CaseStudyFigures.svelte';
	import { constructionCompanyCaseStudy as caseStudy } from '$lib/data/caseStudies';
</script>

<section class="mx-auto max-w-6xl px-6 py-20 md:py-24">
	<p class="font-display text-sm tracking-widest text-signal uppercase">Case study</p>
	<h2 class="mt-5 font-display text-3xl leading-tight font-medium md:text-5xl">
		{caseStudy.clientName}
	</h2>
	<p class="mt-4 max-w-2xl text-chalk/50">{caseStudy.clientDescription}</p>
	<div class="mt-10 grid gap-8 md:grid-cols-2 md:gap-12">
		<p class="text-chalk/70">{caseStudy.problem}</p>
		<p class="text-chalk/70">{caseStudy.idea}</p>
	</div>
	<p class="mt-10 max-w-4xl font-display text-xl leading-relaxed text-chalk/90 md:text-2xl">
		{caseStudy.outcome}
	</p>
	<div class="mt-12">
		<CaseStudyFigures figures={caseStudy.figures} />
	</div>
	<a
		href={caseStudy.href}
		class="mt-10 inline-block rounded-full border border-signal/60 px-6 py-2.5 font-display text-sm
			text-signal transition hover:bg-signal hover:text-night"
	>
		Read the full case study
	</a>
</section>
