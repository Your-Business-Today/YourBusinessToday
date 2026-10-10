<script lang="ts">
	import AboutStorySection from '$lib/components/about/AboutStorySection.svelte';
	import AboutTeamSection from '$lib/components/about/AboutTeamSection.svelte';
	import EnquirySection from '$lib/components/home/EnquirySection.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';

	const pageTitle = 'About — Your Business Today';
	const pageDescription =
		'Your Business Today is a consultancy that learns how a business really runs, maps and fixes the process, and builds and manages the software that takes the repeat work off its people.';
</script>

<PageMeta title={pageTitle} description={pageDescription} path="/about" />

<AboutStorySection />
<AboutTeamSection />
<EnquirySection />
