<script lang="ts">
	import ProseText from '$lib/components/site/ProseText.svelte';
	import { formatBritishDateTime } from '$lib/data/britishDate';
	import { postedViaChannels } from '$lib/data/conversationTurn';
	import { handOffLabel, type NameOf } from '$lib/data/turnLabels';
	import type { NamedMessage } from '$lib/server/conversations/withAuthorNames';

	let {
		message,
		nameOf,
		viewerId
	}: { message: NamedMessage; nameOf: NameOf; viewerId: string } = $props();

	const internalClasses = 'bg-carriage/40';
	const handOff = $derived(
		message.awaiting === null ? null : handOffLabel(message.awaiting, nameOf, viewerId)
	);
</script>

<li class={`flex flex-col gap-1 px-5 py-4 ${message.isInternal ? internalClasses : ''}`}>
	<p class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-chalk/50">
		<span class="font-display text-chalk/80">{message.authorName}</span>
		{#if message.postedVia === postedViaChannels.claude}
			<span
				title="Written by their Claude through the connector"
				class="rounded-full border border-caution/40 px-1.5 font-display text-caution"
			>
				✦ via Claude
			</span>
		{/if}
		<span>· {formatBritishDateTime(message.createdAt)}</span>
		{#if message.isInternal}
			<span>· <span class="text-caution">internal</span></span>
		{/if}
		{#if handOff !== null}
			<span class="font-display text-chalk/60" title="Who this message waits on">→ {handOff}</span>
		{/if}
	</p>
	<ProseText text={message.body} class="text-chalk/90" />
</li>
