<script lang="ts">
	import LinkPageLinkList from '$lib/components/linkPage/LinkPageLinkList.svelte';
	import LinkPageProfile from '$lib/components/linkPage/LinkPageProfile.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';
	import { linkPagePath } from '$lib/data/linkPages/linkPages';

	let { data } = $props();

	const linkPage = $derived(data.linkPage);
	const pageTitle = $derived(`${linkPage.fullName} | Links`);
</script>

<PageMeta title={pageTitle} description={linkPage.introduction} path={linkPagePath(linkPage)} />

<section class="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-12 sm:py-16">
	<LinkPageProfile {linkPage} />
	<LinkPageLinkList links={linkPage.links} />
</section>
