<script lang="ts">
	import { conversationChannelLabels, type LeadConversation } from '$lib/data/leadConversationRules';
	import { formatBritishDate } from '$lib/data/britishDate';

	let { conversation }: { conversation: LeadConversation } = $props();

	const withWhom = $derived(conversation.personName === '' ? '' : ` with ${conversation.personName}`);
	const heading = $derived(
		`${formatBritishDate(conversation.heldOn)}, ${conversationChannelLabels[conversation.channel]}, ${conversation.heldByName}${withWhom}`
	);
</script>

<div class="flex flex-col gap-4">
	<p class="text-sm text-chalk-subtle">{heading}</p>
	<p class="whitespace-pre-wrap text-chalk">{conversation.summary}</p>
	{#if conversation.dealPoints !== ''}
		<h3 class="font-display text-base">Key information about the deal</h3>
		<p class="text-sm whitespace-pre-wrap text-chalk-muted">{conversation.dealPoints}</p>
	{/if}
</div>
