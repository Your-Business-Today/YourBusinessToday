<script lang="ts">
	import { taskStatusLabels, type TaskStatus } from '$lib/data/taskStatus';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';

	let { task }: { task: ProjectTask } = $props();

	const statusOptions = Object.entries(taskStatusLabels) as [TaskStatus, string][];
	const fieldClasses =
		'rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none focus:border-go';
</script>

<div class="grid gap-4 sm:grid-cols-2">
	<label class="flex flex-col gap-1">
		<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Status</span>
		<select name="status" value={task.status} class={fieldClasses}>
			{#each statusOptions as [statusValue, statusLabel] (statusValue)}
				<option value={statusValue}>{statusLabel}</option>
			{/each}
		</select>
	</label>
	<label class="flex flex-col gap-1">
		<span class="font-display text-sm tracking-widest text-chalk/50 uppercase">Due date</span>
		<input name="dueDate" type="date" value={task.dueDate ?? ''} class={fieldClasses} />
	</label>
</div>
