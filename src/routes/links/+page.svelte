<script lang="ts">
	import LinkPageLinkList from '$lib/components/linkPage/LinkPageLinkList.svelte';
	import LinkPageProfile from '$lib/components/linkPage/LinkPageProfile.svelte';
	import PageMeta from '$lib/components/site/PageMeta.svelte';
	import { ybtLinkPage } from '$lib/data/linkPages/ybtLinkPage';

	const pageTitle = `${ybtLinkPage.title} | Links`;
</script>

<PageMeta title={pageTitle} description={ybtLinkPage.introduction} path={ybtLinkPage.path} />

<section class="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-12 sm:py-16">
	<LinkPageProfile linkPage={ybtLinkPage} />
	<LinkPageLinkList links={ybtLinkPage.links} />
</section>
