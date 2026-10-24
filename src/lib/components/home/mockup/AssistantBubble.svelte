<script lang="ts">
	import AssistantActionChips from './AssistantActionChips.svelte';
	import type { AssistantLine } from '$lib/data/home/assistantMockup';

	let { line }: { line: AssistantLine } = $props();

	const hasFootnote = $derived(line.footnote !== '');
</script>

{#if line.isFromPerson}
	<p class="self-end rounded-xl rounded-br-sm bg-signal px-2 py-1 text-[0.45rem] font-medium text-night">
		{line.text}
	</p>
{/if}
{#if !line.isFromPerson}
	<div
		class="flex flex-col gap-1 self-start rounded-xl rounded-bl-sm border border-hairline bg-carriage
			px-2 py-1.5 text-[0.45rem] text-chalk/90"
	>
		<p>{line.text}</p>
		{#each line.items as item (item)}
			<p class="text-chalk">• {item}</p>
		{/each}
		{#if hasFootnote}
			<p class="text-chalk/50">{line.footnote}</p>
		{/if}
		<AssistantActionChips actions={line.actions} />
	</div>
{/if}
