<script lang="ts">
	import TaskFoldButton from './TaskFoldButton.svelte';
	import { needsUserStory } from '$lib/data/userStoryRule';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	let {
		task,
		isOpen,
		panelId,
		onToggle
	}: { task: TaskTreeNode; isOpen: boolean; panelId: string; onToggle: () => void } = $props();

	const titleWeight = $derived(task.parentTaskId === null ? 'text-sm font-medium' : 'text-sm');
	const subtasks = $derived(task.subtasks);
</script>

<div class="flex min-w-0 items-center gap-1.5">
	<TaskFoldButton subtaskCount={subtasks.length} {isOpen} {panelId} {onToggle} />
	<a
		href={`/projects/${task.projectId}/tasks/${task.id}`}
		class={`truncate font-display transition hover:text-go ${titleWeight}`}
	>
		{#if task.isUserStory}
			<span title="User story" class="text-caution">◆</span>
		{:else if needsUserStory(task)}
			<span title="No user story yet — edit the task to write one" class="text-chalk/30">◇</span>
		{/if}
		{task.title}
	</a>
</div>
