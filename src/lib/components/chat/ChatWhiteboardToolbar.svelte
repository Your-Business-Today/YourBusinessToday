<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import ChatWhiteboardPalette from './ChatWhiteboardPalette.svelte';
	import { canUndo } from '$lib/data/chat/whiteboardHistory';
	import { whiteboardToolLabels } from './whiteboardToolWords';
	import type { WhiteboardBoard } from './whiteboardBoard.svelte';
	import type { WhiteboardTool } from '$lib/data/chat/chatWhiteboardRules';

	let { board }: { board: WhiteboardBoard } = $props();

	const isUndoable = $derived(canUndo(board.history));

	function choose(tool: WhiteboardTool) {
		board.tool = tool;
		board.textAt = null;
	}
</script>

<div class="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Drawing tools">
	{#each whiteboardToolLabels as choice (choice.tool)}
		<Button look={board.tool === choice.tool ? 'primary' : 'secondary'} onclick={() => choose(choice.tool)}>{choice.label}</Button>
	{/each}
	<Button look="ghost" disabled={!isUndoable} onclick={() => board.undo()}>Undo</Button>
</div>
<ChatWhiteboardPalette {board} />
