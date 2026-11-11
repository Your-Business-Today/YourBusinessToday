<script lang="ts">
	import BusinessBrainChatbotRow from './BusinessBrainChatbotRow.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';

	let {
		chatbots,
		canManage,
		addresses,
		isBrainLinked
	}: { chatbots: BusinessBrainChatbot[]; canManage: boolean; addresses: BusinessBrainAddresses; isBrainLinked: boolean } = $props();

	function questionsHrefOf(chatbot: BusinessBrainChatbot): string | null {
		if (!canManage) return null;
		return addresses.chatbotQuestions(chatbot.chatbotId);
	}
</script>

<DashboardPanel title="Brains" count={chatbots.length}>
	{#snippet actions()}
		{#if isBrainLinked}
			<a href={addresses.home} class="font-display text-sm text-chalk-subtle transition hover:text-chalk">Open Your Business Brain</a>
		{/if}
	{/snippet}
	{#if chatbots.length === 0}
		<p class={panelEmptyClasses}>
			No brain is made yet. A manager makes one through the connector, saying what it is for, the parts it may read and who uses it.
		</p>
	{:else}
		<ul class={panelListClasses}>
			{#each chatbots as chatbot (chatbot.chatbotId)}
				<BusinessBrainChatbotRow {chatbot} questionsHref={questionsHrefOf(chatbot)} />
			{/each}
		</ul>
	{/if}
</DashboardPanel>
