<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import { boardActionFields } from '$lib/data/boardActionForm';
	import { actionDepartments, departmentLabelOf } from '$lib/data/boardroomActionRules';

	let { projects }: { projects: { id: string; name: string }[] } = $props();

	let projectId = $state('');
	const hasProject = $derived(projectId !== '');
</script>

<div class="flex flex-wrap gap-3">
	<FormField label="Project" hint="None puts it on the owner's own to-do list" class="min-w-0 flex-1">
		<select name={boardActionFields.projectId} bind:value={projectId}>
			<option value="">None</option>
			{#each projects as project (project.id)}
				<option value={project.id}>{project.name}</option>
			{/each}
		</select>
	</FormField>
	{#if hasProject}
		<FormField label="Department" hint="The job the owner does there" class="min-w-0 flex-1">
			<select name={boardActionFields.department} required>
				{#each actionDepartments as department (department)}
					<option value={department}>{departmentLabelOf(department)}</option>
				{/each}
			</select>
		</FormField>
	{/if}
</div>
