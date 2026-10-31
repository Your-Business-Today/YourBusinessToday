<script lang="ts">
	import PriorityControls from './PriorityControls.svelte';
	import PriorityNumberButton from '$lib/components/site/PriorityNumberButton.svelte';

	let {
		taskId,
		taskTitle,
		numberPath,
		isFirst,
		isLast,
		onSetPriority
	}: {
		taskId: string;
		taskTitle: string;
		numberPath: string;
		isFirst: boolean;
		isLast: boolean;
		onSetPriority: () => void;
	} = $props();
</script>

<div class="-ml-1 flex shrink-0 items-center gap-0.5">
	<PriorityControls moveAction="?/moveTask" fieldName="taskId" id={taskId} {isFirst} {isLast} />
	<PriorityNumberButton
		label={numberPath}
		itemName={taskTitle}
		class="min-w-8 rounded-md bg-night/60 px-1.5 py-1 text-center font-display text-xs
			tabular-nums text-chalk/50"
		onclick={onSetPriority}
	/>
</div>
