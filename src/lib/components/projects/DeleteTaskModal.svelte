<script lang="ts">
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';
	import { countOf } from '$lib/data/countOf';
	import { fieldClasses } from '$lib/components/site/formStyles';
	import { finishedTaskStays, taskDeletionInputs, type FamilyTask, type TaskDeletionPlan } from '$lib/data/taskDeletion';
	import { isTaskDone } from '$lib/data/taskStatus';

	let { plan, isOpen = $bindable() }: { plan: TaskDeletionPlan; isOpen: boolean } = $props();

	const title = 'Delete task';
	const moveItBackFirst = 'If it was marked done by mistake, change its status first.';
	const { keepFinishedUnderTitle, deleteOpenSubtasks } = taskDeletionInputs;
	const openSubtasksGoToo: Record<string, string> = { [deleteOpenSubtasks]: 'true' };

	const { task, finishedSubtasks, openSubtasks } = $derived(plan);
	const fields = $derived(openSubtasks.length === 0 ? {} : openSubtasksGoToo);
	const description = $derived(
		`This permanently deletes “${task.title}” with its conversation and history. This cannot be undone.`
	);
</script>

{#snippet subtaskList(heading: string, subtasks: FamilyTask[])}
	<div class="flex flex-col gap-1 text-sm">
		<p class="font-medium text-chalk">{heading}</p>
		<ul class="flex max-h-32 list-disc flex-col gap-1 overflow-y-auto pl-5 text-chalk/70">
			{#each subtasks as subtask (subtask.id)}
				<li>{subtask.title}</li>
			{/each}
		</ul>
	</div>
{/snippet}

{#if isTaskDone(task.status)}
	<Modal {title} bind:isOpen>
		<p class="text-sm text-chalk/70">{finishedTaskStays(task)} {moveItBackFirst}</p>
	</Modal>
{:else}
	<DangerConfirmModal {title} {description} action="?/deleteTask" {fields} submitLabel={title} bind:isOpen>
		{#if finishedSubtasks.length > 0}
			{@render subtaskList(
				`Kept, under a new completed task: ${countOf(finishedSubtasks.length, 'finished subtask')}`,
				finishedSubtasks
			)}
			<SmallCapsField label="Call the completed task">
				<input name={keepFinishedUnderTitle} required placeholder="The work those subtasks finished" class={fieldClasses} />
			</SmallCapsField>
		{/if}
		{#if openSubtasks.length > 0}
			{@render subtaskList(`Deleted with it: ${countOf(openSubtasks.length, 'open subtask')}`, openSubtasks)}
			<p class="text-xs text-chalk/50">To keep one, move it out from under this task before deleting.</p>
		{/if}
	</DangerConfirmModal>
{/if}
