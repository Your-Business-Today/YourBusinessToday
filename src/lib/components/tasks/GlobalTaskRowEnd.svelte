<script lang="ts">
	import TaskDueDate from '$lib/components/projects/TaskDueDate.svelte';
	import TaskMetaBadges from '$lib/components/projects/TaskMetaBadges.svelte';
	import TaskStatusButton from '$lib/components/projects/TaskStatusButton.svelte';
	import WaitsForPill from '$lib/components/sequences/WaitsForPill.svelte';
	import { sequenceStandingOf } from '$lib/data/taskSequenceStanding';
	import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';

	let {
		task,
		isDone,
		onChangeStatus
	}: { task: GlobalTask; isDone: boolean; onChangeStatus: (task: GlobalTask) => void } = $props();

	const standing = $derived(sequenceStandingOf(task, task.waitsFor));
</script>

<div class="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">
	<WaitsForPill {standing} />
	<TaskMetaBadges {task} />
	{#if task.dueDate !== null}
		<TaskDueDate dueDate={task.dueDate} {isDone} />
	{/if}
	<TaskStatusButton status={task.status} kind={task.kind} onOpenPicker={() => onChangeStatus(task)} />
</div>
