<script lang="ts">
	import { companyDetails } from '$lib/data/companyDetails';

	let {
		title,
		description,
		path,
		kind = 'website',
		imageUrl = null
	}: {
		title: string;
		description: string;
		path: string;
		kind?: 'website' | 'article';
		imageUrl?: string | null;
	} = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:type" content={kind} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={`${companyDetails.websiteUrl}${path}`} />
	{#if imageUrl !== null}
		<meta property="og:image" content={imageUrl} />
	{/if}
</svelte:head>
