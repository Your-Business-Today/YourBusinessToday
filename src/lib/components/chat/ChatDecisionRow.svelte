<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import ProseText from '$lib/components/site/ProseText.svelte';
	import { chatDecisionStatuses, type ListedChatDecision } from '$lib/data/chat/chatDecisionRules';
	import { closedSentence, decisionAnchor, raisedSentence } from '$lib/data/chat/chatDecisionWords';
	import { decisionStatusBadges } from './chatPageWords';

	let { decision, onClose }: { decision: ListedChatDecision; onClose: (decision: ListedChatDecision) => void } = $props();

	const badge = $derived(decisionStatusBadges[decision.status]);
	const isOpen = $derived(decision.status === chatDecisionStatuses.open);
	const closedNote = $derived(closedSentence(decision));
	const hasMessageWords = $derived(decision.messageWords !== '');
</script>

<li id={decisionAnchor(decision.id)} class="flex flex-col gap-1.5 px-4 py-3">
	<div class="flex flex-wrap items-start justify-between gap-2">
		<p class="min-w-0 flex-1 text-sm text-chalk">{decision.wording}</p>
		<Badge label={badge.label} tone={badge.tone} />
	</div>
	{#if hasMessageWords}
		<p class="line-clamp-2 text-xs text-chalk-faint">From the message: “{decision.messageWords}”</p>
	{/if}
	<p class="text-xs text-chalk-subtle">{raisedSentence(decision)}</p>
	{#if decision.outcome !== null}
		<ProseText text={decision.outcome} class="text-sm text-chalk/90" />
	{/if}
	{#if closedNote !== null}
		<p class="text-xs text-chalk-subtle">{closedNote}</p>
	{/if}
	{#if isOpen}
		<div>
			<Button onclick={() => onClose(decision)}>Close with an outcome</Button>
		</div>
	{/if}
</li>
