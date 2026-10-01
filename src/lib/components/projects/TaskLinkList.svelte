<script lang="ts">
	import TaskKindPill from './TaskKindPill.svelte';
	import { isTaskDone } from '$lib/data/taskStatus';
	import { panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import { taskStatusLabelFor } from '$lib/data/taskKind';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { tasks }: { tasks: ProjectTask[] } = $props();
</script>

<ul class={panelListClasses}>
	{#each tasks as task (task.id)}
		<li>
			<a
				href={`/projects/${task.projectId}/tasks/${task.id}`}
				class="flex items-center justify-between gap-3 px-4 py-2.5 transition hover:bg-night/40"
				class:opacity-50={isTaskDone(task.status)}
			>
				<span class="flex min-w-0 items-center gap-2">
					<span class="truncate font-display text-sm">{task.title}</span>
					<TaskKindPill kind={task.kind} status={task.status} />
				</span>
				<span class="shrink-0 font-display text-xs whitespace-nowrap text-chalk/50">
					{taskStatusLabelFor(task.kind, task.status)}
				</span>
			</a>
		</li>
	{/each}
</ul>
