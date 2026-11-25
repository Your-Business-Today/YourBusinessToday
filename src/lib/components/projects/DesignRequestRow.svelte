<script lang="ts">
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { task, change }: { task: ProjectTask; change: string } = $props();
</script>

<li class="flex min-w-0 flex-col gap-1 px-4 py-3">
	<a
		href={`/projects/${task.projectId}/tasks/${task.id}`}
		title={task.title}
		class="line-clamp-2 font-display text-sm leading-snug transition hover:text-go"
	>
		{task.title}
	</a>
	<p class="text-xs text-chalk/60">What it changes: {change}</p>
</li>
