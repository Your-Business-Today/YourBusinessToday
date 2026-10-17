<script lang="ts">
	import TaskKindPill from './TaskKindPill.svelte';
	import { needsUserStory } from '$lib/data/userStoryRule';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	let { task }: { task: TaskTreeNode } = $props();

	const isMissingStory = $derived(!task.isUserStory && needsUserStory(task));
	const subtasks = $derived(task.subtasks);
	const subtaskCount = $derived(subtasks.length);
	const subtaskLabel = $derived(subtaskCount === 1 ? '1 subtask' : `${subtaskCount} subtasks`);
	const tagClasses = 'rounded-full border px-2 py-0.5 font-display text-xs whitespace-nowrap';
</script>

{#if task.isUserStory}
	<span title="A user story" class={`${tagClasses} border-caution/40 bg-caution/10 text-caution`}>
		◆ User story
	</span>
{/if}
{#if isMissingStory}
	<span
		title="No user story yet — edit the task to write one"
		class={`${tagClasses} border-dashed border-chalk/20 text-chalk/40`}
	>
		◇ Story to write
	</span>
{/if}
<TaskKindPill kind={task.kind} status={task.status} />
{#if subtaskCount > 0}
	<span class={`${tagClasses} border-hairline text-chalk/50`}>{subtaskLabel}</span>
{/if}
