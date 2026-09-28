<script lang="ts">
	import PriorityControls from '$lib/components/projects/PriorityControls.svelte';
	import ChevronIcon from '$lib/components/site/ChevronIcon.svelte';
	import ReorderableRow from '$lib/components/site/ReorderableRow.svelte';
	import TaskDueDate from '$lib/components/projects/TaskDueDate.svelte';
	import TaskMetaBadges from '$lib/components/projects/TaskMetaBadges.svelte';
	import TaskStatusButton from '$lib/components/projects/TaskStatusButton.svelte';
	import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';
	import type { ListReorder } from '$lib/client/listReorder.svelte';

	let {
		task,
		listReorder,
		positionNumber,
		isFirst,
		isLast,
		shouldIncludeDone,
		canReorder,
		onChangeStatus,
		isExpanded,
		onToggleDetail
	}: {
		task: GlobalTask;
		listReorder: ListReorder;
		positionNumber: number;
		isFirst: boolean;
		isLast: boolean;
		shouldIncludeDone: boolean;
		canReorder: boolean;
		onChangeStatus: (task: GlobalTask) => void;
		isExpanded: boolean;
		onToggleDetail: (task: GlobalTask) => void;
	} = $props();

	const isDone = $derived(task.status === 'done');
</script>

<ReorderableRow
	{listReorder}
	rowId={task.id}
	class="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-5 {isDone
		? 'opacity-50'
		: ''}"
>
	{#snippet children(dragHandle)}
		{#if canReorder}
			{@render dragHandle()}
			<PriorityControls
				moveAction="?/moveTask"
				fieldName="taskId"
				id={task.id}
				extraFields={{ includeDone: String(shouldIncludeDone) }}
				{isFirst}
				{isLast}
			/>
		{/if}
		<span class="min-w-8 text-right font-display text-sm text-chalk/40">{positionNumber}</span>
		<div class="min-w-0 flex-1 basis-40">
			<button
				type="button"
				onclick={() => onToggleDetail(task)}
				title={isExpanded ? 'Hide the details' : 'Show the details'}
				aria-expanded={isExpanded}
				class="flex w-full items-center gap-1.5 text-left font-display transition hover:text-go"
			>
				<span class="truncate">
					{#if task.isUserStory}<span title="User story" class="text-caution">◆</span>{/if}
					{task.title}
				</span>
				<span class="shrink-0 text-chalk/40"><ChevronIcon isOpen={isExpanded} /></span>
			</button>
			<a
				href={`/projects/${task.projectId}`}
				class="block truncate text-xs text-chalk/50 transition hover:text-go"
			>
				{task.projectName}
			</a>
		</div>
		<div class="ml-auto flex shrink-0 items-center gap-2">
			<TaskMetaBadges {task} />
			{#if task.dueDate !== null}
				<TaskDueDate dueDate={task.dueDate} {isDone} />
			{/if}
			<TaskStatusButton status={task.status} kind={task.kind} onOpenPicker={() => onChangeStatus(task)} />
		</div>
	{/snippet}
</ReorderableRow>
