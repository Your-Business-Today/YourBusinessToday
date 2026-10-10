<script lang="ts">
	import CaseStudySection from '$lib/components/home/CaseStudySection.svelte';
	import EnquirySection from '$lib/components/home/EnquirySection.svelte';
	import HarnessSection from '$lib/components/home/HarnessSection.svelte';
	import HeroSection from '$lib/components/home/HeroSection.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';
	import TeamSection from '$lib/components/home/TeamSection.svelte';
	import TwoDoorsSection from '$lib/components/home/TwoDoorsSection.svelte';
	import WhatWeDoSection from '$lib/components/home/WhatWeDoSection.svelte';
	import { companyDetails } from '$lib/data/companyDetails';

	const pageTitle = 'Your Business Today — put AI to work in your business';
	const pageDescription =
		'A consultancy that automates businesses with AI: we map your data sources, build the harness that holds them, equip an AI agent with the skills to run the processes around it, and give you dashboards and an MCP server on to it.';
	const shareImageUrl = `${companyDetails.websiteUrl}/favicon.svg`;
</script>

<PageMeta title={pageTitle} description={pageDescription} path="" imageUrl={shareImageUrl} />

<HeroSection />
<WhatWeDoSection />
<HarnessSection />
<TwoDoorsSection />
<CaseStudySection />
<TeamSection />
<EnquirySection />
