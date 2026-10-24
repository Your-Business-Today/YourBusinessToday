<script lang="ts">
	import CaseStudyCalendarSection from '$lib/components/case-study/CaseStudyCalendarSection.svelte';
	import CaseStudyIdeaSection from '$lib/components/case-study/CaseStudyIdeaSection.svelte';
	import CaseStudyIntroSection from '$lib/components/case-study/CaseStudyIntroSection.svelte';
	import CaseStudyOutcomeSection from '$lib/components/case-study/CaseStudyOutcomeSection.svelte';
	import DiscoveryCallSection from '$lib/components/home/DiscoveryCallSection.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';
	import PortalScreensSection from '$lib/components/case-study/PortalScreensSection.svelte';
	import { constructionCompanyCaseStudy as caseStudy } from '$lib/data/caseStudies';

	const pageTitle = 'Construction company case study | Your Business Today';
	const pageDescription =
		'How a family run construction company moved from messages and photographs to a portal its own assistant can read. Two weeks of discovery and proof and then sixteen weeks of building on one idea.';
</script>

<PageMeta title={pageTitle} description={pageDescription} path={caseStudy.href} kind="article" />

<CaseStudyIntroSection />
<CaseStudyIdeaSection />
<CaseStudyCalendarSection />
<CaseStudyOutcomeSection />
<PortalScreensSection />
<DiscoveryCallSection />
