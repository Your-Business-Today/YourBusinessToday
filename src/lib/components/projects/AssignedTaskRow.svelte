<script lang="ts">
	import { taskStatusLabels } from '$lib/data/taskStatus';
	import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';

	let { assignedTask }: { assignedTask: GlobalTask } = $props();
</script>

<li>
	<a
		href={`/projects/${assignedTask.projectId}/tasks/${assignedTask.id}`}
		class="flex flex-col gap-1 px-4 py-2.5 transition hover:bg-night/40 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
	>
		<span class="flex min-w-0 flex-col gap-0.5">
			<span class="truncate font-display text-sm">{assignedTask.title}</span>
			<span class="truncate text-xs text-chalk/60">{assignedTask.projectName}</span>
		</span>
		<span class="shrink-0 font-display text-xs whitespace-nowrap text-chalk/50">
			{taskStatusLabels[assignedTask.status]}
		</span>
	</a>
</li>
