<script lang="ts">
	import { taskMoveWarnings } from '$lib/data/taskMove';
	import type { ProjectChoice } from '$lib/server/projects/getOtherProjects';
	import type { ProjectTask } from '$lib/server/projects/taskRecord';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let {
		parentTask,
		siblingTasks,
		otherProjects
	}: {
		parentTask: ProjectTask | null;
		siblingTasks: ProjectTask[];
		otherProjects: ProjectChoice[];
	} = $props();

	const stayOnThisProject = '';
	let destinationProjectId = $state(stayOnThisProject);

	const isLeavingTheProject = $derived(destinationProjectId !== stayOnThisProject);
	const currentPositionLabel = $derived(
		parentTask === null
			? 'Where it is now (top level)'
			: `Where it is now (under “${parentTask.title}”)`
	);
	const fieldClasses =
		'rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none focus:border-go';
</script>

<SmallCapsField label="Project">
	<select name="destinationProjectId" bind:value={destinationProjectId} class={fieldClasses}>
		<option value={stayOnThisProject}>Stay on this project</option>
		{#each otherProjects as otherProject (otherProject.id)}
			<option value={otherProject.id}>Move to {otherProject.name}</option>
		{/each}
	</select>
</SmallCapsField>

{#if isLeavingTheProject}
	<ul
		class="flex list-disc flex-col gap-2 rounded-2xl border border-caution/40 bg-caution/10
			py-4 pr-5 pl-9 text-sm text-caution"
	>
		{#each taskMoveWarnings as warning (warning)}
			<li>{warning}</li>
		{/each}
	</ul>
{:else}
	<SmallCapsField label="Move to">
		<select name="moveTo" value="keep" class={fieldClasses}>
			<option value="keep">{currentPositionLabel}</option>
			{#if parentTask !== null}
				<option value="up">Up one level — beside “{parentTask.title}”</option>
			{/if}
			{#each siblingTasks as siblingTask (siblingTask.id)}
				<option value={siblingTask.id}>Subtask of “{siblingTask.title}”</option>
			{/each}
		</select>
	</SmallCapsField>
{/if}
