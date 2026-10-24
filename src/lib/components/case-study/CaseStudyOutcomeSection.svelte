<script lang="ts">
	import CaseStudyFigures from './CaseStudyFigures.svelte';
	import { constructionCompanyCaseStudy as caseStudy } from '$lib/data/caseStudies';
	import { constructionBuildFigures } from '$lib/data/constructionBuild';
</script>

<section class="mx-auto max-w-4xl px-6 py-20 md:py-24">
	<p class="font-display text-sm tracking-widest text-signal uppercase">Where it got to</p>
	<h2 class="mt-5 font-display text-3xl leading-tight font-medium md:text-4xl">
		What the company runs on today.
	</h2>
	<p class="mt-8 max-w-3xl text-lg text-chalk/80">{caseStudy.outcome}</p>
	<p class="mt-6 max-w-3xl text-chalk/80">
		That last part is why the chat we had built into the portal came out again in August. People
		do not want another window to go and look at. They already have an assistant open so the work
		should be reachable from inside it. A connector does that. A chat box on a website never will.
	</p>
	<div class="mt-12">
		<CaseStudyFigures figures={constructionBuildFigures} />
	</div>
	<a
		href="/offer"
		class="mt-10 inline-block rounded-full border border-hairline px-6 py-2.5 font-display text-sm
			text-chalk/80 transition hover:border-chalk/40 hover:text-chalk"
	>
		How an engagement works
	</a>
</section>
