<script lang="ts">
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';

	let { brains, addresses }: { brains: BusinessBrainChatbot[]; addresses: BusinessBrainAddresses } = $props();

	const hasBrains = $derived(brains.length > 0);
</script>

{#if hasBrains}
	<p class="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-hairline px-4 py-3 text-sm text-chalk/60">
		<span>Questions asked of</span>
		{#each brains as brain (brain.chatbotId)}
			<a class="text-chalk/80 underline-offset-2 transition hover:text-go hover:underline" href={addresses.chatbotQuestions(brain.chatbotId)}>{brain.name}</a>
		{/each}
	</p>
{/if}
