<script lang="ts">
	import TaskKindPill from './TaskKindPill.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { projectCrumbs } from '$lib/components/workspace/projectCrumbs';
	import { taskStatusLabelFor } from '$lib/data/taskKind';
	import {
		headerButtonClasses,
		headerDangerButtonClasses,
		headerPrimaryButtonClasses
	} from '$lib/components/workspace/workspaceStyles';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	type LinkedProject = { id: string; name: string };
	type LinkedTask = { id: string; title: string };

	let {
		project,
		parentTask,
		task,
		onEdit,
		onAddSubtask,
		onDelete
	}: {
		project: LinkedProject;
		parentTask: LinkedTask | null;
		task: ProjectTask;
		onEdit: () => void;
		onAddSubtask: () => void;
		onDelete: () => void;
	} = $props();
</script>

<WorkspaceHeader crumbs={projectCrumbs(project, parentTask)} title={task.title}>
	{#snippet badge()}
		<span
			class="shrink-0 rounded-full border border-hairline px-2.5 py-0.5 font-display text-xs
				whitespace-nowrap text-chalk/70"
		>
			{taskStatusLabelFor(task.kind, task.status)}
		</span>
		<TaskKindPill kind={task.kind} status={task.status} />
	{/snippet}
	{#snippet actions()}
		<button type="button" onclick={onDelete} class={headerDangerButtonClasses}>Delete</button>
		<button type="button" onclick={onAddSubtask} class={headerButtonClasses}>＋ Subtask</button>
		<button type="button" onclick={onEdit} class={headerPrimaryButtonClasses}>Edit task</button>
	{/snippet}
</WorkspaceHeader>
