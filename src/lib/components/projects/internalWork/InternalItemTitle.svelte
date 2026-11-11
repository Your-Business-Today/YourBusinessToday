<script lang="ts">
	import ChevronIcon from '$lib/components/site/ChevronIcon.svelte';
	import { taskPagePath, taskSheet } from '$lib/client/taskSheet.svelte';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	let {
		task,
		depth,
		todoCount,
		isOpen,
		onToggle
	}: { task: TaskTreeNode; depth: number; todoCount: number; isOpen: boolean; onToggle: () => void } = $props();

	const sheetTarget = $derived({ projectId: task.projectId, taskId: task.id });
	const todoNoun = $derived(todoCount === 1 ? 'to-do' : 'to-dos');
	const toggleLabel = $derived(isOpen ? `Hide the ${todoNoun}` : `Show ${todoCount} ${todoNoun}`);
</script>

<div class="flex min-w-60 items-start gap-1.5 md:min-w-72" style:padding-left="{depth}rem">
	<button
		type="button"
		onclick={onToggle}
		title={toggleLabel}
		aria-label={toggleLabel}
		aria-expanded={isOpen}
		class="flex shrink-0 items-center gap-0.5 rounded p-0.5 text-xs text-chalk-subtle transition hover:text-chalk"
	>
		<ChevronIcon {isOpen} />
		{todoCount}
	</button>
	<a
		href={taskPagePath(sheetTarget)}
		onclick={(event) => taskSheet.openOnPlainClick(event, sheetTarget)}
		title={task.title}
		class="line-clamp-2 font-display leading-snug transition hover:text-go"
	>
		{task.title}
	</a>
</div>
