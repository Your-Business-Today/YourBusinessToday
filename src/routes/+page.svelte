<script lang="ts">
	import CaseStudySection from '$lib/components/home/CaseStudySection.svelte';
	import EnquirySection from '$lib/components/home/EnquirySection.svelte';
	import HarnessSection from '$lib/components/home/HarnessSection.svelte';
	import HeroSection from '$lib/components/home/HeroSection.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';
	import ProjectSystemSection from '$lib/components/home/ProjectSystemSection.svelte';
	import TeamSection from '$lib/components/home/TeamSection.svelte';
	import TwoDoorsSection from '$lib/components/home/TwoDoorsSection.svelte';
	import WhatWeDoSection from '$lib/components/home/WhatWeDoSection.svelte';
	import { companyDetails } from '$lib/data/companyDetails';

	const pageTitle = 'Your Business Today | We use AI to streamline your business today';
	const pageDescription =
		'We use AI to streamline your business today. We map how information moves through your company and build the tools that automate the work around it.';
	const shareImageUrl = `${companyDetails.websiteUrl}/favicon.svg`;
</script>

<PageMeta title={pageTitle} description={pageDescription} path="" imageUrl={shareImageUrl} />

<HeroSection />
<WhatWeDoSection />
<HarnessSection />
<TwoDoorsSection />
<ProjectSystemSection />
<CaseStudySection />
<TeamSection />
<EnquirySection />
