<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import { decisionAnchor } from '$lib/data/chat/chatDecisionWords';
	import { decisionStatusBadges } from './chatPageWords';
	import type { ListedChatDecision } from '$lib/data/chat/chatDecisionRules';

	let { decisions, onRaise }: { decisions: ListedChatDecision[]; onRaise: (() => void) | null } = $props();
</script>

<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
	{#each decisions as decision (decision.id)}
		{@const badge = decisionStatusBadges[decision.status]}
		<a href={`#${decisionAnchor(decision.id)}`} class="font-display text-chalk-muted underline-offset-2 hover:text-go hover:underline">
			⚑ Decision raised here: {badge.label}
		</a>
	{/each}
	{#if onRaise !== null}
		<Button look="ghost" onclick={onRaise}>Raise a decision</Button>
	{/if}
</div>
