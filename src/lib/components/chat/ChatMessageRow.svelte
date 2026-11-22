<script lang="ts">
	import ProseText from '$lib/components/site/ProseText.svelte';
	import { formatBritishDateTime } from '$lib/data/britishDate';
	import { postedViaChannels } from '$lib/data/conversationTurn';
	import type { NamedChatMessage } from '$lib/server/chat/readChatMessages';

	let { message }: { message: NamedChatMessage } = $props();

	const isByClaude = $derived(message.postedVia === postedViaChannels.claude);
</script>

<li class="flex flex-col gap-1 px-4 py-3">
	<p class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-chalk-subtle">
		<span class="font-display text-chalk">{message.authorName}</span>
		{#if isByClaude}
			<span title="Written by their Claude through the connector" class="font-display text-caution">✦ via Claude</span>
		{/if}
		<time datetime={message.createdAt}>· {formatBritishDateTime(message.createdAt)}</time>
	</p>
	<ProseText text={message.body} class="text-chalk/90" />
</li>
