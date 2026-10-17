<script lang="ts">
	import TaskStatusButton from './TaskStatusButton.svelte';
	import type { TaskRowActions } from './taskRowActions';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	let { task, actions }: { task: TaskTreeNode; actions: TaskRowActions } = $props();
</script>

<div class="ml-auto flex shrink-0 items-center gap-2 pt-0.5">
	<TaskStatusButton
		status={task.status}
		kind={task.kind}
		onOpenPicker={() => actions.onChangeStatus(task)}
	/>
	<button
		type="button"
		onclick={() => actions.onAddSubtask(task)}
		title="Add subtask"
		aria-label={`Add subtask to ${task.title}`}
		class="rounded-full border border-hairline px-2.5 py-1 font-display text-xs text-chalk/50
			transition hover:border-go hover:text-go sm:opacity-0 sm:group-hover/task:opacity-100
			sm:focus-visible:opacity-100"
	>
		＋
	</button>
</div>
