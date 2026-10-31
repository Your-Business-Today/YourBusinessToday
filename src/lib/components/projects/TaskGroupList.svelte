<script lang="ts">
	import TaskListRow from './TaskListRow.svelte';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';
	import type { TaskRowActions } from './taskRowActions';

	let {
		panelId,
		tasks,
		actions
	}: { panelId: string; tasks: TaskTreeNode[]; actions: TaskRowActions } = $props();
</script>

<ol id={panelId} class="flex flex-col gap-3 p-2 sm:p-3">
	{#each tasks as task, taskIndex (task.id)}
		<li class="rounded-xl">
			<TaskListRow
				{task}
				numberPath={`${task.priority}`}
				isFirst={taskIndex === 0}
				isLast={taskIndex === tasks.length - 1}
				{actions}
			/>
		</li>
	{/each}
</ol>
