<script lang="ts">
	import ActionsMenu, { menuItemClasses } from '$lib/components/site/ActionsMenu.svelte';
	import TaskStatusChip from './TaskStatusChip.svelte';
	import type { TaskRowActions } from './taskRowActions';
	import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

	let { task, actions }: { task: TaskTreeNode; actions: TaskRowActions } = $props();

	let isOpen = $state(false);

	const editHref = $derived(`/projects/${task.projectId}/tasks/${task.id}?edit`);

	function choose(menuAction: (chosenTask: TaskTreeNode) => void) {
		isOpen = false;
		menuAction(task);
	}
</script>

{#snippet menuItem(label: string, menuAction: (chosenTask: TaskTreeNode) => void)}
	<button type="button" role="menuitem" onclick={() => choose(menuAction)} class={menuItemClasses}>
		{label}
	</button>
{/snippet}

<div class="ml-auto flex shrink-0 items-center gap-2">
	<TaskStatusChip status={task.status} kind={task.kind} />
	<ActionsMenu subjectName={task.title} menuWidthClass="w-48" bind:isOpen>
		{@render menuItem('Change status…', actions.onChangeStatus)}
		{@render menuItem('Change goal…', actions.onChangeGoal)}
		{@render menuItem('Story points…', actions.onChangeStoryPoints)}
		{@render menuItem('Autocomplete…', actions.onChangeAutocomplete)}
		{@render menuItem('Add subtask…', actions.onAddSubtask)}
		<a href={editHref} role="menuitem" class={menuItemClasses}>Edit…</a>
	</ActionsMenu>
</div>
