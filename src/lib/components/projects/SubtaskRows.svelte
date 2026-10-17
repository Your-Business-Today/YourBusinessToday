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

	const subtasks = $derived(parentTask.subtasks);
</script>

<ol id={panelId} class="mt-2 ml-2 flex flex-col gap-2 border-l-2 border-hairline pl-2 sm:ml-8 sm:pl-4">
	{#each subtasks as subtask, subtaskIndex (subtask.id)}
		<TaskListRow
			task={subtask}
			numberPath={`${numberPath}.${subtask.priority}`}
			isFirst={subtaskIndex === 0}
			isLast={subtaskIndex === subtasks.length - 1}
			{listReorder}
			{actions}
		/>
	{/each}
</ol>
