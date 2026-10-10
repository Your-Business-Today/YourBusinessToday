<script lang="ts">
	import PageMeta from '$lib/components/site/PageMeta.svelte';
	import VisionArticle from '$lib/components/vision/VisionArticle.svelte';

	const pageTitle = 'What we build — Your Business Today';
	const pageDescription =
		'Generic AI has never met your business. We put your data into a harness it can read, teach it the processes around that harness, and let it act through an MCP server under the same roles as your screens.';
</script>

<PageMeta title={pageTitle} description={pageDescription} path="/vision" />

<VisionArticle />
