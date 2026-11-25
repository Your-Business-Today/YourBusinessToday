<script lang="ts">
	import ConversationBaton from './ConversationBaton.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import ConversationComposer from './ConversationComposer.svelte';
	import MessageRow from './MessageRow.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import { accountNameLookup } from '$lib/data/accountNames';
	import { currentTurn } from '$lib/data/currentTurn';
	import { nextActionOf, type NextActionFacts } from '$lib/data/nextAction';
	import { threadPostsOf } from '$lib/data/threadAsks';
	import type { NamedMessage } from '$lib/server/conversations/withAuthorNames';
	import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';

	let {
		messages,
		people,
		viewerId,
		taskFacts = null
	}: {
		messages: NamedMessage[];
		people: ProjectPerson[];
		viewerId: string;
		taskFacts?: Omit<NextActionFacts, 'posts'> | null;
	} = $props();

	const nameOf = $derived(accountNameLookup(people));
	const turn = $derived(currentTurn(messages));
	const nextAction = $derived(taskFacts === null ? null : nextActionOf({ ...taskFacts, posts: threadPostsOf(messages) }));
</script>

<DashboardPanel title="Conversation" count={messages.length}>
	<div class="px-4 pt-3"><ConversationBaton {turn} {nameOf} {viewerId} {nextAction} /></div>
	{#if messages.length === 0}
		<p class={panelEmptyClasses}>
			Nothing said yet. Whatever is posted here is read by everyone on the project — and by their
			Claude.
		</p>
	{:else}
		<ul class={panelListClasses}>
			{#each messages as message (message.id)}
				<MessageRow {message} {nameOf} {viewerId} />
			{/each}
		</ul>
	{/if}
	<div class="border-t border-hairline p-4">
		<ConversationComposer {people} {viewerId} />
	</div>
</DashboardPanel>
