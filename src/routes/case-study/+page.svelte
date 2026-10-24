<script lang="ts">
	import CaseStudyBusinessSection from '$lib/components/case-study/CaseStudyBusinessSection.svelte';
	import CaseStudyIntroSection from '$lib/components/case-study/CaseStudyIntroSection.svelte';
	import CaseStudyMethodSection from '$lib/components/case-study/CaseStudyMethodSection.svelte';
	import DiscoveryCallSection from '$lib/components/home/DiscoveryCallSection.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';
	import PortalScreensSection from '$lib/components/case-study/PortalScreensSection.svelte';
	import { caseStudyBusinesses, caseStudyPath } from '$lib/data/caseStudies';

	const pageTitle = 'Case study: three businesses on a portal we built | Your Business Today';
	const pageDescription =
		'A construction company, a fire door company and a property management company, each running on a portal built in weeks around how that business works, with their own AI assistant connected to it.';
</script>

<PageMeta title={pageTitle} description={pageDescription} path={caseStudyPath} kind="article" />

<CaseStudyIntroSection />
{#each caseStudyBusinesses as business (business.id)}
	<CaseStudyBusinessSection {business} />
{/each}
<PortalScreensSection />
<CaseStudyMethodSection />
<DiscoveryCallSection />
