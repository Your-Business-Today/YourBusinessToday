<script lang="ts">
	import { formatBritishDate } from '$lib/data/britishDate';
	import { taskStatusLabels } from '$lib/data/taskStatus';
	import { todoTaskPath } from '$lib/data/todoLinks';
	import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';

	let { task }: { task: GlobalTask } = $props();
</script>

<li class="flex flex-col gap-0.5 px-4 py-3">
	<a href={todoTaskPath(task.projectId, task.id)} class="font-display text-chalk/90 hover:underline">
		{task.title}
	</a>
	<span class="text-xs text-chalk/50">
		{task.projectName} · {taskStatusLabels[task.status]}
		{#if task.dueDate !== null}· due {formatBritishDate(task.dueDate)}{/if}
	</span>
</li>
