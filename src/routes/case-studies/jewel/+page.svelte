<script lang="ts">
	import EnquirySection from '$lib/components/home/EnquirySection.svelte';
	import JewelCalendarSection from '$lib/components/case-study/JewelCalendarSection.svelte';
	import JewelIdeaSection from '$lib/components/case-study/JewelIdeaSection.svelte';
	import JewelIntroSection from '$lib/components/case-study/JewelIntroSection.svelte';
	import JewelOutcomeSection from '$lib/components/case-study/JewelOutcomeSection.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';

	const pageTitle = 'Jewel Bespoke Build — a case study — Your Business Today';
	const pageDescription =
		'How a family-run Surrey construction company moved from messages and photographs to a portal its own assistant can read: two weeks of discovery and proof, sixteen weeks of building, one idea.';
</script>

<PageMeta title={pageTitle} description={pageDescription} path="/case-studies/jewel" kind="article" />

<JewelIntroSection />
<JewelIdeaSection />
<JewelCalendarSection />
<JewelOutcomeSection />
<EnquirySection />
