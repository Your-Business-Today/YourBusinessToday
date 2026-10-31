<script lang="ts">
	import TaskFoldButton from './TaskFoldButton.svelte';
	import { taskPagePath, taskSheet } from '$lib/client/taskSheet.svelte';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	let {
		task,
		isOpen,
		panelId,
		onToggle
	}: { task: TaskTreeNode; isOpen: boolean; panelId: string; onToggle: () => void } = $props();

	const titleWeight = $derived(task.parentTaskId === null ? 'text-base font-medium' : 'text-sm');
	const subtasks = $derived(task.subtasks);
	const sheetTarget = $derived({ projectId: task.projectId, taskId: task.id });
</script>

<div
	class="order-last flex min-w-0 basis-full items-start gap-1.5 pt-0.5 sm:order-none sm:flex-1
		sm:basis-0"
>
	<TaskFoldButton subtaskCount={subtasks.length} {isOpen} {panelId} {onToggle} />
	<a
		href={taskPagePath(sheetTarget)}
		onclick={(event) => taskSheet.openOnPlainClick(event, sheetTarget)}
		title={task.title}
		class={`line-clamp-2 font-display leading-snug transition hover:text-go ${titleWeight}`}
	>
		{task.title}
	</a>
</div>
