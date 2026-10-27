<script lang="ts">
	import BusinessAppSection from '$lib/components/home/BusinessAppSection.svelte';
	import BuiltForSection from '$lib/components/home/BuiltForSection.svelte';
	import DiscoveryCallSection from '$lib/components/home/DiscoveryCallSection.svelte';
	import HeroSection from '$lib/components/home/HeroSection.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';
	import TeamSection from '$lib/components/home/TeamSection.svelte';
	import WhatWeDoSection from '$lib/components/home/WhatWeDoSection.svelte';
	import { companyDetails } from '$lib/data/companyDetails';
	import { buildTimeline } from '$lib/data/consultancyOffer';

	const pageTitle = `Your Business Today | We build your business app or platform in ${buildTimeline}`;
	const pageDescription = `Your own app, built around how your business works, plus an AI assistant your team can simply talk to. Live in ${buildTimeline}, then changed however you want for one monthly fee. For UK business owners and MDs.`;
	const shareImageUrl = `${companyDetails.websiteUrl}/favicon.svg`;
</script>

<PageMeta title={pageTitle} description={pageDescription} path="" imageUrl={shareImageUrl} />

<HeroSection />
<BusinessAppSection />
<WhatWeDoSection />
<BuiltForSection />
<TeamSection />
<DiscoveryCallSection />
