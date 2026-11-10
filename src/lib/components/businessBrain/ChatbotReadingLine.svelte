<script lang="ts">
	import { pageGivenHref } from './chatbotTrailLinks';
	import { pageGivenPhrase, readingAskedFor, readingShortfall, whenOnUkClock } from '$lib/data/businessBrainChatbotTrailWording';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { ChatbotReadingRecord } from '$lib/server/businessBrain/readChatbotTrailParts';

	let { reading, addresses }: { reading: ChatbotReadingRecord; addresses: BusinessBrainAddresses } = $props();

	const askedFor = $derived(readingAskedFor(reading));
	const shortfall = $derived(readingShortfall(reading));
	const readAt = $derived(whenOnUkClock(reading.readAt));
</script>

<li class="flex min-w-0 flex-col gap-1 text-sm">
	<span class="break-words text-chalk-muted">{askedFor} <span class="text-xs text-chalk-subtle">· {readAt}</span></span>
	{#if shortfall !== null}
		<span class="break-words text-xs text-chalk-subtle">{shortfall}</span>
	{:else}
		<span class="flex flex-wrap gap-x-3 gap-y-1">
			{#each reading.pagesGiven as page (`${page.pageId}/${page.revisionId}`)}
				<a href={pageGivenHref(addresses, page)} class="break-words text-go underline underline-offset-2">{pageGivenPhrase(page)}</a>
			{/each}
		</span>
	{/if}
</li>
