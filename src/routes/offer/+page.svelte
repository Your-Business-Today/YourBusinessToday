<script lang="ts">
	import DiscoveryCallSection from '$lib/components/home/DiscoveryCallSection.svelte';
	import OfferStepsSection from '$lib/components/offer/OfferStepsSection.svelte';
	import OfferTermsSection from '$lib/components/offer/OfferTermsSection.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';
	import { buildTimeline } from '$lib/data/consultancyOffer';

	const pageTitle = 'The offer | Your Business Today';
	const pageDescription = `What we do for your business, in seven steps from mapping your data sources to changing the app however you want. Your app live in ${buildTimeline}, then one monthly fee to keep it running.`;
</script>

<PageMeta title={pageTitle} description={pageDescription} path="/offer" />

<OfferStepsSection />
<OfferTermsSection />
<DiscoveryCallSection />
