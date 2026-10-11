<script lang="ts">
	import EnquirySection from '$lib/components/home/EnquirySection.svelte';
	import OfferHarnessSection from '$lib/components/offer/OfferHarnessSection.svelte';
	import OfferIntroSection from '$lib/components/offer/OfferIntroSection.svelte';
	import OfferStepsSection from '$lib/components/offer/OfferStepsSection.svelte';
	import OfferTermsSection from '$lib/components/offer/OfferTermsSection.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';

	const pageTitle = 'The offer | Your Business Today';
	const pageDescription =
		'How an engagement with Your Business Today works. Two weeks mapping your data sources. The harness built first. One process taught to your assistant at a time. One monthly fee to keep it running.';
</script>

<PageMeta title={pageTitle} description={pageDescription} path="/offer" />

<OfferIntroSection />
<OfferStepsSection />
<OfferHarnessSection />
<OfferTermsSection />
<EnquirySection />
