<script lang="ts">
	import AboutStorySection from '$lib/components/about/AboutStorySection.svelte';
	import AboutTeamSection from '$lib/components/about/AboutTeamSection.svelte';
	import DiscoveryCallSection from '$lib/components/home/DiscoveryCallSection.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';

	const pageTitle = 'About us | Your Business Today';
	const pageDescription =
		'Your Business Today learns how a business really runs and builds the app, the AI assistant and the processes that take the repeat work off its people.';
</script>

<PageMeta title={pageTitle} description={pageDescription} path="/about" />

<AboutStorySection />
<AboutTeamSection />
<DiscoveryCallSection />
