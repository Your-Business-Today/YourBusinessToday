<script lang="ts">
	import PersonInitials from '$lib/components/workspace/PersonInitials.svelte';
	import TaskDueDate from '../TaskDueDate.svelte';
	import StatusSelect from './StatusSelect.svelte';
	import { departmentLabels } from '$lib/data/department';
	import { isTaskDone } from '$lib/data/taskStatus';
	import { taskPagePath, taskSheet } from '$lib/client/taskSheet.svelte';
	import { groupToneClasses, taskStatusChoices } from './internalWorkStyles';
	import type { InternalItem } from './internalWorkGroups';
	import type { TaskAssignee } from '../taskRowActions';

	let { item, owners }: { item: InternalItem; owners: TaskAssignee[] } = $props();

	const task = $derived(item.task);
	const sheetTarget = $derived({ projectId: task.projectId, taskId: task.id });
	const record = $derived({ name: 'taskId', value: task.id });
	const ownerNames = $derived(owners.map((owner) => owner.name).join(', '));
</script>

<li class="flex flex-col gap-2 rounded-lg border border-hairline bg-night/40 p-3">
	<a
		href={taskPagePath(sheetTarget)}
		onclick={(event) => taskSheet.openOnPlainClick(event, sheetTarget)}
		title={task.title}
		class="line-clamp-3 font-display text-sm leading-snug transition hover:text-go"
	>
		{task.title}
	</a>
	<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
		<span class={['font-display text-xs', groupToneClasses[task.department]]}>{departmentLabels[task.department]}</span>
		{#if task.dueDate !== null}
			<TaskDueDate dueDate={task.dueDate} isDone={isTaskDone(task.status)} isLabelled />
		{/if}
	</div>
	<div class="flex items-center justify-between gap-2">
		<span class="flex items-center gap-1" title={ownerNames === '' ? 'No owner' : ownerNames}>
			{#each owners as owner (owner.id)}
				<PersonInitials name={owner.name} />
			{:else}
				<span class="text-xs text-chalk-faint">No owner</span>
			{/each}
		</span>
		<StatusSelect action="?/setStatus" {record} choices={taskStatusChoices} current={task.status} label={`Move “${task.title}” to another column`} />
	</div>
</li>
