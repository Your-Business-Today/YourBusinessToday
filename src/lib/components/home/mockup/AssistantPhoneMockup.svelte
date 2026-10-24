<script lang="ts">
	import AssistantBubble from './AssistantBubble.svelte';
	import {
		assistantMockupConversation,
		assistantMockupPlaceholder,
		assistantMockupTitle
	} from '$lib/data/home/assistantMockup';
</script>

<div class="flex flex-col gap-2 rounded-[1.75rem] border-[5px] border-hairline bg-night p-3 shadow-2xl">
	<p class="flex items-center gap-1.5 border-b border-hairline pb-2 font-display text-[0.6rem] font-medium">
		<span class="h-1.5 w-1.5 rounded-full bg-signal"></span>{assistantMockupTitle}
	</p>
	<div class="flex flex-col gap-1.5">
		{#each assistantMockupConversation as line, index (index)}
			<AssistantBubble {line} />
		{/each}
	</div>
	<p class="mt-1 rounded-full border border-hairline px-2.5 py-1 text-[0.45rem] text-chalk/40">
		{assistantMockupPlaceholder}
	</p>
</div>
