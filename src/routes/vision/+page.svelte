<script lang="ts">
	import PageMeta from '$lib/components/site/PageMeta.svelte';
	import VisionArticle from '$lib/components/vision/VisionArticle.svelte';

	const pageTitle = 'What we build | Your Business Today';
	const pageDescription =
		'Generic AI has never met your business. We put your data in one place it can read and teach it the processes around it. Your assistant then works under the same roles as your screens.';
</script>

<PageMeta title={pageTitle} description={pageDescription} path="/vision" />

<VisionArticle />
