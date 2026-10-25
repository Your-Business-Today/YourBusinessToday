<script lang="ts">
	import { describeStagingStanding } from '$lib/data/stagedTasks';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { task }: { task: ProjectTask } = $props();

	const standing = $derived(describeStagingStanding(task));
</script>

<li class="flex min-w-0 flex-col gap-1 px-4 py-3">
	<a
		href={`/projects/${task.projectId}/tasks/${task.id}`}
		title={task.title}
		class="line-clamp-2 font-display text-sm leading-snug transition hover:text-go"
	>
		{task.title}
	</a>
	<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-chalk/60">
		<span>{standing}</span>
		{#if task.pullRequestUrl !== ''}
			<a href={task.pullRequestUrl} target="_blank" rel="noopener" class="text-go hover:brightness-110">
				Pull request ↗
			</a>
		{/if}
	</div>
</li>
