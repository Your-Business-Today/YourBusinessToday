<script lang="ts">
	import ConversationBaton from './ConversationBaton.svelte';
	import ConversationComposer from './ConversationComposer.svelte';
	import MessageRow from './MessageRow.svelte';
	import { accountNameLookup } from '$lib/data/accountNames';
	import { latestTurn, type HandOff } from '$lib/data/conversationTurn';
	import type { NamedMessage } from '$lib/server/conversations/withAuthorNames';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

	let {
		messages,
		people,
		viewerId,
		suggestedHandOff
	}: {
		messages: NamedMessage[];
		people: ProjectPerson[];
		viewerId: string;
		suggestedHandOff: HandOff | null;
	} = $props();

	const nameOf = $derived(accountNameLookup(people));
	const turn = $derived(latestTurn(messages));
</script>

<section class="flex flex-col gap-3">
	<h2 class="font-display text-xl font-medium">Conversation</h2>
	<ConversationBaton {turn} {nameOf} {viewerId} />
	{#if messages.length === 0}
		<p class="rounded-2xl border border-dashed border-hairline p-6 text-chalk/60">
			Nothing said yet. Whatever is posted here is read by everyone on the project — and by their
			Claude.
		</p>
	{:else}
		<ul class="flex flex-col divide-y divide-hairline rounded-2xl border border-hairline">
			{#each messages as message (message.id)}
				<MessageRow {message} {nameOf} {viewerId} />
			{/each}
		</ul>
	{/if}
	<ConversationComposer {people} {viewerId} {suggestedHandOff} />
</section>
