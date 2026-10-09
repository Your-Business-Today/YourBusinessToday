<script lang="ts">
	import { formatBritishDateTime } from '$lib/data/britishDate';
	import type { DatabaseTask } from '$lib/server/databaseTasks/databaseTaskRecord';

	let { task, runnerName }: { task: DatabaseTask; runnerName: string } = $props();

	const runLine = $derived(
		task.runAt === null ? '' : `run ${formatBritishDateTime(task.runAt)}${runnerName === '' ? '' : ` by ${runnerName}`}`
	);
</script>

<li class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5">
	<div class="flex min-w-0 flex-col">
		<a href={`/projects/${task.projectId}`} class="truncate font-display text-sm transition hover:text-go">
			{task.projectName}
		</a>
		<code class="truncate text-xs text-chalk/60">{task.filePath}</code>
	</div>
	<span class="text-xs text-chalk/40">{runLine}</span>
</li>
