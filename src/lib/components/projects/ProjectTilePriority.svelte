<script lang="ts">
	import PriorityNumberButton from '$lib/components/site/PriorityNumberButton.svelte';
	import { projectTilePriorityClasses } from './projectTileStyles';

	let {
		priority,
		projectName,
		onSetPriority
	}: { priority: number; projectName: string; onSetPriority: () => void } = $props();
</script>

<PriorityNumberButton
	label={priority}
	itemName={projectName}
	class={`relative ${projectTilePriorityClasses}`}
	onclick={onSetPriority}
/>
