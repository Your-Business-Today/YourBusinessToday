<script lang="ts">
	import ChatDecisionCloseForm from './ChatDecisionCloseForm.svelte';
	import ChatDecisionRow from './ChatDecisionRow.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import { decisionsTitle } from '$lib/data/chat/chatDecisionWords';
	import { openDecisionCount } from '$lib/data/chat/chatDecisionOrder';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ListedChatDecision } from '$lib/data/chat/chatDecisionRules';

	let { decisions }: { decisions: ListedChatDecision[] } = $props();

	let isCloseOpen = $state(false);
	let closing = $state<ListedChatDecision | null>(null);

	const openCount = $derived(openDecisionCount(decisions));

	function openClose(decision: ListedChatDecision) {
		closing = decision;
		isCloseOpen = true;
	}
</script>

<DashboardPanel title={decisionsTitle} count={`${openCount} open`}>
	<ul class={panelListClasses} aria-label="Decisions raised in this room, open ones first">
		{#each decisions as decision (decision.id)}
			<ChatDecisionRow {decision} onClose={openClose} />
		{/each}
	</ul>
</DashboardPanel>

<Modal title="Close the decision with its outcome" bind:isOpen={isCloseOpen}>
	{#if closing !== null}
		{#key closing.id}
			<ChatDecisionCloseForm decision={closing} onClosed={() => (isCloseOpen = false)} />
		{/key}
	{/if}
</Modal>
