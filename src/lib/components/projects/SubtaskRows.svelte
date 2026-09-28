<script lang="ts">
	import TaskListRow from './TaskListRow.svelte';
	import type { ListReorder } from '$lib/client/listReorder.svelte';
	import type { TaskRowActions } from './taskRowActions';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	let {
		parentTask,
		numberPath,
		panelId,
		listReorder,
		actions
	}: {
		parentTask: TaskTreeNode;
		numberPath: string;
		panelId: string;
		listReorder: ListReorder;
		actions: TaskRowActions;
	} = $props();
</script>

<ol id={panelId} class="ml-7 flex flex-col border-l border-hairline sm:ml-12">
	{#each parentTask.subtasks as subtask, subtaskIndex (subtask.id)}
		<TaskListRow
			task={subtask}
			numberPath={`${numberPath}.${subtask.priority}`}
			isFirst={subtaskIndex === 0}
			isLast={subtaskIndex === parentTask.subtasks.length - 1}
			{listReorder}
			{actions}
		/>
	{/each}
</ol>
