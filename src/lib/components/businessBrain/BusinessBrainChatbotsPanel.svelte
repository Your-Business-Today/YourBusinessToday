<script lang="ts">
	import BusinessBrainChatbotRow from './BusinessBrainChatbotRow.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';

	let {
		chatbots,
		canManage,
		addresses
	}: { chatbots: BusinessBrainChatbot[]; canManage: boolean; addresses: BusinessBrainAddresses } = $props();

	function questionsHrefOf(chatbot: BusinessBrainChatbot): string | null {
		if (!canManage) return null;
		return addresses.chatbotQuestions(chatbot.chatbotId);
	}
</script>

<DashboardPanel title="Chatbots" count={chatbots.length}>
	{#if chatbots.length === 0}
		<p class={panelEmptyClasses}>
			No chatbot is made yet. A manager makes one through the connector, naming the parts it may read and who uses it.
		</p>
	{:else}
		<ul class={panelListClasses}>
			{#each chatbots as chatbot (chatbot.chatbotId)}
				<BusinessBrainChatbotRow {chatbot} questionsHref={questionsHrefOf(chatbot)} />
			{/each}
		</ul>
	{/if}
</DashboardPanel>
