<script lang="ts">
	import { constructionCompanyCaseStudy as caseStudy } from '$lib/data/caseStudies';
</script>

<section class="mx-auto max-w-4xl px-6 py-20 md:py-24">
	<p class="font-display text-sm tracking-widest text-signal uppercase">Case study</p>
	<h1 class="mt-5 font-display text-4xl leading-tight font-medium md:text-5xl">
		{caseStudy.clientName}
	</h1>
	<p class="mt-4 max-w-3xl text-chalk/50">{caseStudy.clientDescription}</p>
	<p class="mt-8 max-w-3xl text-lg text-chalk/80">{caseStudy.problem}</p>
	<p class="mt-6 max-w-3xl text-chalk/80">
		None of that is a software problem to begin with. It is a question about how work moves
		through a business. It has to be answered on paper before anybody writes anything.
	</p>
</section>
