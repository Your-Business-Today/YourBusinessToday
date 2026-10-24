<script lang="ts">
	import { caseStudyPath } from '$lib/data/caseStudies';
</script>

<div class="flex flex-col gap-4">
	<p class="font-display text-sm tracking-widest text-go uppercase">Request received</p>
	<h2 class="font-display text-2xl font-medium">Thank you. We will be in touch to fix a time.</h2>
	<p class="text-chalk/70">
		Your request is with the team. Expect an email within a couple of working days to agree a time
		for the call.
	</p>
	<a
		href={caseStudyPath}
		class="self-start rounded-full border border-hairline px-6 py-2.5 font-display text-sm
			text-chalk/80 transition hover:border-chalk/40 hover:text-chalk"
	>
		Read the case study while you wait
	</a>
</div>
