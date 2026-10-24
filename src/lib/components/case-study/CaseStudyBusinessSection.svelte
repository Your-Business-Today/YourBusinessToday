<script lang="ts">
	import CaseStudyOutcomes from './CaseStudyOutcomes.svelte';
	import type { CaseStudyBusiness } from '$lib/data/caseStudies';

	let { business }: { business: CaseStudyBusiness } = $props();
</script>

<section class="border-t border-hairline">
	<div class="mx-auto max-w-4xl px-6 py-20 md:py-24">
		<h2 class="font-display text-3xl leading-tight font-medium md:text-4xl">{business.kind}</h2>
		<h3 class="mt-10 font-display text-sm tracking-widest text-signal uppercase">What they needed</h3>
		<p class="mt-4 max-w-3xl text-lg text-chalk/80">{business.needed}</p>
		<h3 class="mt-10 font-display text-sm tracking-widest text-signal uppercase">
			What runs on the portal now
		</h3>
		<div class="mt-4">
			<CaseStudyOutcomes outcomes={business.outcomes} />
		</div>
	</div>
</section>
