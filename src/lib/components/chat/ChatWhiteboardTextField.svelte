<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { chatWhiteboardLimits } from '$lib/data/chat/chatWhiteboardRules';
	import { keyboardKeys } from '$lib/client/keyboardKeys';
	import type { WhiteboardBoard } from './whiteboardBoard.svelte';

	let { board }: { board: WhiteboardBoard } = $props();

	let text = $state('');

	const hasWords = $derived(text.trim() !== '');

	function place() {
		if (!hasWords) return;
		board.placeText(text.trim());
		text = '';
	}

	function placeOnEnter(event: KeyboardEvent) {
		if (event.key !== keyboardKeys.enter) return;
		event.preventDefault();
		place();
	}
</script>

<div class="flex flex-wrap items-end gap-2">
	<FormField label="Words to place where you tapped" class="min-w-0 flex-1">
		<input type="text" bind:value={text} maxlength={chatWhiteboardLimits.longestText} onkeydown={placeOnEnter} />
	</FormField>
	<Button look="primary" disabled={!hasWords} onclick={place}>Place</Button>
	<Button look="ghost" onclick={() => (board.textAt = null)}>Cancel</Button>
</div>
