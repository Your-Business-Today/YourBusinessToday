<script lang="ts">
	import BrandWordmark from '$lib/components/site/BrandWordmark.svelte';
	import PageTitle from '$lib/components/site/PageTitle.svelte';
	import type { LinkPage } from '$lib/data/linkPages/linkPage';

	let { linkPage }: { linkPage: LinkPage } = $props();

	const wordmarkSize = 44;
</script>

<header class="flex flex-col items-center gap-4 text-center">
	<span
		class="flex h-28 w-28 items-center justify-center rounded-full border border-hairline-strong bg-carriage"
	>
		<BrandWordmark fontSize={wordmarkSize} />
	</span>
	<PageTitle>{linkPage.title}</PageTitle>
	<p class="text-chalk-muted">{linkPage.introduction}</p>
</header>
