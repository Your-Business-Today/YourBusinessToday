<script lang="ts">
	import { untrack } from 'svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import ProseText from '$lib/components/site/ProseText.svelte';
	import { askYourClaudeToCatchUp, catchUpTitle, coverageSentence, missedSentence } from '$lib/data/chat/chatCatchUpWords';
	import type { ChatCatchUp } from '$lib/data/chat/chatCatchUp';

	let { catchUp }: { catchUp: ChatCatchUp | null } = $props();

	const keptAsOpened = untrack(() => catchUp);
	const summary = keptAsOpened?.summary ?? null;
	const missed = keptAsOpened === null ? null : missedSentence(keptAsOpened.messagesAfterSummary);
	const isAskingForOne = keptAsOpened !== null && summary === null;
</script>

{#if summary !== null}
	<DashboardPanel title={catchUpTitle} isPadded>
		<div class="flex flex-col gap-2">
			<ProseText text={summary.words} class="text-chalk/90" />
			<p class="text-xs text-chalk-subtle">{coverageSentence(summary)}</p>
			{#if missed !== null}
				<p class="text-sm text-chalk-subtle">{missed}</p>
			{/if}
		</div>
	</DashboardPanel>
{/if}
{#if isAskingForOne}
	<p class="text-sm text-chalk-subtle">{askYourClaudeToCatchUp}</p>
{/if}
