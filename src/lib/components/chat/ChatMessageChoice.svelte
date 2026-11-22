<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';

	let {
		authorName,
		isChosen,
		onToggle,
		onChooseFromHere
	}: { authorName: string; isChosen: boolean; onToggle: () => void; onChooseFromHere: () => void } = $props();
</script>

<div class="flex shrink-0 flex-col items-center gap-1 pt-0.5">
	<input type="checkbox" class="size-4 accent-go" checked={isChosen} onchange={onToggle} aria-label={`Move this message by ${authorName}`} />
	<Button look="ghost" label="From here on: choose this message and every one after it" onclick={onChooseFromHere}>From here on</Button>
</div>
