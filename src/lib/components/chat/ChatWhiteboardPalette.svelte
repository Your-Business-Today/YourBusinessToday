<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import { whiteboardColours, whiteboardTools } from '$lib/data/chat/chatWhiteboardRules';
	import { whiteboardColourLabels, whiteboardSwatchClasses } from './whiteboardColours';
	import { whiteboardSizeChoices, whiteboardWidthChoices } from './whiteboardToolWords';
	import type { WhiteboardBoard } from './whiteboardBoard.svelte';

	let { board }: { board: WhiteboardBoard } = $props();

	const isWriting = $derived(board.tool === whiteboardTools.text);
</script>

<div class="flex flex-wrap items-center gap-2">
	<div class="flex flex-wrap items-center gap-1" role="group" aria-label="Colour">
		{#each whiteboardColours as colour (colour)}
			<Button look={board.colour === colour ? 'primary' : 'ghost'} isIconOnly label={whiteboardColourLabels[colour]} onclick={() => (board.colour = colour)}>
				<span class={`h-5 w-5 rounded-full ${whiteboardSwatchClasses[colour]}`} aria-hidden="true"></span>
			</Button>
		{/each}
	</div>
	{#if isWriting}
		<div class="flex flex-wrap items-center gap-1" role="group" aria-label="Text size">
			{#each whiteboardSizeChoices as choice (choice.value)}
				<Button look={board.textSize === choice.value ? 'primary' : 'secondary'} onclick={() => (board.textSize = choice.value)}>{choice.label}</Button>
			{/each}
		</div>
	{:else}
		<div class="flex flex-wrap items-center gap-1" role="group" aria-label="Pen width">
			{#each whiteboardWidthChoices as choice (choice.value)}
				<Button look={board.penWidth === choice.value ? 'primary' : 'secondary'} onclick={() => (board.penWidth = choice.value)}>{choice.label}</Button>
			{/each}
		</div>
	{/if}
</div>
