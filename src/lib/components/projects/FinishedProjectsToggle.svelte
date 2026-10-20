<script lang="ts">
	import { filterChipClasses } from './filterChipClasses';

	let {
		isShowingFinished = $bindable(),
		finishedCount
	}: { isShowingFinished: boolean; finishedCount: number } = $props();

	const label = $derived(isShowingFinished ? 'Hide finished' : `Show finished (${finishedCount})`);
</script>

{#if finishedCount > 0}
	<button
		type="button"
		onclick={() => (isShowingFinished = !isShowingFinished)}
		aria-pressed={isShowingFinished}
		title="Finished projects are in maintenance or complete with no open task"
		class={`shrink-0 ${filterChipClasses(isShowingFinished)}`}
	>
		{label}
	</button>
{/if}
