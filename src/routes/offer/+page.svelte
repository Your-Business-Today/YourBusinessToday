<script lang="ts">
	import EnquirySection from '$lib/components/home/EnquirySection.svelte';
	import OfferHarnessSection from '$lib/components/offer/OfferHarnessSection.svelte';
	import OfferIntroSection from '$lib/components/offer/OfferIntroSection.svelte';
	import OfferStepsSection from '$lib/components/offer/OfferStepsSection.svelte';
	import OfferTermsSection from '$lib/components/offer/OfferTermsSection.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';

	const pageTitle = 'The offer — Your Business Today';
	const pageDescription =
		'How an engagement with Your Business Today works: two weeks mapping your data sources, the harness built as the first stage, one process taught to the agent a stage, dashboards and an MCP server on the same roles, and a monthly fee to keep it running.';
</script>

<PageMeta title={pageTitle} description={pageDescription} path="/offer" />

<OfferIntroSection />
<OfferStepsSection />
<OfferHarnessSection />
<OfferTermsSection />
<EnquirySection />
