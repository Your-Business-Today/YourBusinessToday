<script lang="ts">
	import BusinessBrainChatbotRow from './BusinessBrainChatbotRow.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';

	let { chatbots }: { chatbots: BusinessBrainChatbot[] } = $props();
</script>

<DashboardPanel title="Chatbots" count={chatbots.length}>
	{#if chatbots.length === 0}
		<p class={panelEmptyClasses}>
			No chatbot is made yet. A manager makes one through the connector, naming the parts it may read and who uses it.
		</p>
	{:else}
		<ul class={panelListClasses}>
			{#each chatbots as chatbot (chatbot.chatbotId)}
				<BusinessBrainChatbotRow {chatbot} />
			{/each}
		</ul>
	{/if}
</DashboardPanel>
