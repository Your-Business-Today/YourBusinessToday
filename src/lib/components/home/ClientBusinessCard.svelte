<script lang="ts">
	import type { CaseStudyBusiness } from '$lib/data/caseStudies';

	let { business }: { business: CaseStudyBusiness } = $props();
</script>

<div class="flex flex-col gap-3 rounded-2xl border border-hairline bg-carriage/60 p-6">
	<h3 class="font-display text-xl font-medium">{business.kind}</h3>
	<p class="text-chalk/70">{business.summary}</p>
</div>
