<script lang="ts">
	import CaseStudySection from '$lib/components/home/CaseStudySection.svelte';
	import EnquirySection from '$lib/components/home/EnquirySection.svelte';
	import HarnessSection from '$lib/components/home/HarnessSection.svelte';
	import HeroSection from '$lib/components/home/HeroSection.svelte';
	import OutcomesSection from '$lib/components/home/OutcomesSection.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';
	import ProblemSection from '$lib/components/home/ProblemSection.svelte';
	import ProjectSystemSection from '$lib/components/home/ProjectSystemSection.svelte';
	import PropositionSection from '$lib/components/home/PropositionSection.svelte';
	import ServiceAreasSection from '$lib/components/home/ServiceAreasSection.svelte';
	import TeamSection from '$lib/components/home/TeamSection.svelte';
	import TwoDoorsSection from '$lib/components/home/TwoDoorsSection.svelte';
	import { companyDetails } from '$lib/data/companyDetails';

	const pageTitle =
		'Your Business Today | The operating system for modern businesses and enterprise intelligence';
	const pageDescription =
		'YourBusinessToday builds AI-enabled operational systems for organisations that have outgrown disconnected tools, siloed information and manual ways of working.';
	const shareImageUrl = `${companyDetails.websiteUrl}/favicon.svg`;
</script>

<PageMeta title={pageTitle} description={pageDescription} path="" imageUrl={shareImageUrl} />

<HeroSection />
<ProblemSection />
<PropositionSection />
<ServiceAreasSection />
<OutcomesSection />
<HarnessSection />
<TwoDoorsSection />
<ProjectSystemSection />
<CaseStudySection />
<TeamSection />
<EnquirySection />
