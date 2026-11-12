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
	<p class="text-chalk">{conversation.summary}</p>
	{#if conversation.whatWasSaid === ''}
		<p class="text-sm text-chalk-faint">Nothing of what was said was kept.</p>
	{:else}
		<p class="max-h-[60vh] overflow-y-auto text-sm whitespace-pre-wrap text-chalk-muted">{conversation.whatWasSaid}</p>
	{/if}
</div>
