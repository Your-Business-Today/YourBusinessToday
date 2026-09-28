<script lang="ts">
	import ChevronIcon from '$lib/components/site/ChevronIcon.svelte';

	let {
		subtaskCount,
		isOpen,
		panelId,
		onToggle
	}: { subtaskCount: number; isOpen: boolean; panelId: string; onToggle: () => void } = $props();

	const subtaskNoun = $derived(subtaskCount === 1 ? 'subtask' : 'subtasks');
	const label = $derived(
		isOpen ? `Hide the ${subtaskNoun}` : `Show ${subtaskCount} ${subtaskNoun}`
	);
</script>

{#if subtaskCount > 0}
	<button
		type="button"
		onclick={onToggle}
		title={label}
		aria-label={label}
		aria-expanded={isOpen}
		aria-controls={panelId}
		class="shrink-0 rounded p-0.5 text-chalk/40 transition hover:bg-carriage hover:text-chalk"
	>
		<ChevronIcon {isOpen} />
	</button>
{:else}
	<span class="inline-block h-4 w-4 shrink-0" aria-hidden="true"></span>
{/if}
