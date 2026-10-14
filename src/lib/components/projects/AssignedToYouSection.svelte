<script lang="ts">
	import AssignedTaskRow from './AssignedTaskRow.svelte';
	import ToActOnSection from './ToActOnSection.svelte';
	import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';

	let { assignedTasks }: { assignedTasks: GlobalTask[] } = $props();
</script>

<ToActOnSection
	title="Assigned to you"
	description="Open tasks assigned to you across all your projects, long term work left out."
	count={assignedTasks.length}
>
	{#each assignedTasks as assignedTask (assignedTask.id)}
		<AssignedTaskRow {assignedTask} />
	{/each}
</ToActOnSection>
