<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import { taskStatusLabels, type TaskStatus } from '$lib/data/taskStatus';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let { task }: { task: ProjectTask } = $props();

	const statusOptions = Object.entries(taskStatusLabels) as [TaskStatus, string][];
</script>

<div class="grid gap-4 sm:grid-cols-2">
	<SmallCapsField label="Status">
		<select name="status" value={task.status} class={fieldClasses}>
			{#each statusOptions as [statusValue, statusLabel] (statusValue)}
				<option value={statusValue}>{statusLabel}</option>
			{/each}
		</select>
	</SmallCapsField>
	<SmallCapsField label="Due date">
		<input name="dueDate" type="date" value={task.dueDate ?? ''} class={fieldClasses} />
	</SmallCapsField>
</div>
