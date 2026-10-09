<script lang="ts">
	import DatabaseTaskConfirmForm from './DatabaseTaskConfirmForm.svelte';
	import DatabaseTaskInstruction from './DatabaseTaskInstruction.svelte';
	import { databaseKindLabels } from '$lib/data/databaseKind';
	import { databaseTaskInstruction } from '$lib/data/databaseTaskInstruction';
	import { formatBritishDateTime } from '$lib/data/britishDate';
	import type { DatabaseTask } from '$lib/server/databaseTasks/databaseTaskRecord';

	let { task }: { task: DatabaseTask } = $props();

	const database = $derived(task.database);
	const instruction = $derived(databaseTaskInstruction(database, task));
	const kindLabel = $derived(databaseKindLabels[database.kind]);
</script>

<li class="flex flex-col gap-2 px-4 py-3">
	<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
		<div class="flex min-w-0 flex-col">
			<a href={`/projects/${task.projectId}`} class="truncate font-display text-sm transition hover:text-go">
				{task.projectName}
			</a>
			<code class="truncate text-xs text-chalk/60">{task.filePath}</code>
		</div>
		<div class="flex items-center gap-3">
			<span class="text-xs text-chalk/40">{kindLabel} · merged {formatBritishDateTime(task.raisedAt)}</span>
			<DatabaseTaskConfirmForm databaseTaskId={task.id} />
		</div>
	</div>
	<DatabaseTaskInstruction {instruction} />
</li>
