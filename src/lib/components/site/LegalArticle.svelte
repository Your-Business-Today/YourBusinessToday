<script lang="ts">
	import LegalSections from '$lib/components/site/LegalSections.svelte';
	import type { LegalDocument } from '$lib/data/legalDocument';

	let { legalDocument }: { legalDocument: LegalDocument } = $props();
</script>

<article class="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
	<p class="font-display text-sm tracking-widest text-signal uppercase">The small print</p>
	<h1 class="font-display text-4xl leading-tight font-medium">{legalDocument.title}</h1>
	<p class="text-sm text-chalk/50">Last updated {legalDocument.lastUpdatedOn}</p>
	<LegalSections sections={legalDocument.sections} />
</article>
