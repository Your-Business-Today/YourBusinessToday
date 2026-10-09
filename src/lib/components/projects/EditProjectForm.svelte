<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import PriorityField from '$lib/components/site/PriorityField.svelte';
	import ProjectDatabaseFields from './ProjectDatabaseFields.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { projectStatusLabels, projectStatusOrder } from '$lib/data/projectStatus';
	import type { Project } from '$lib/server/projects/projectRecord';

	let { project, onSaved }: { project: Project; onSaved: () => void } = $props();

	const tracker = new FormTracker();

	const fieldClasses =
		'rounded-xl border border-hairline bg-night px-4 py-2.5 text-chalk outline-none focus:border-go';
	const labelClasses = 'font-display text-sm tracking-widest text-chalk/50 uppercase';
</script>

<form
	method="POST"
	action="?/updateProject"
	use:enhance={tracker.submit(onSaved)}
	class="flex flex-col gap-4"
>
	<input type="hidden" name="projectId" value={project.id} />
	<label class="flex flex-col gap-1">
		<span class={labelClasses}>Name</span>
		<input name="name" required value={project.name} class={fieldClasses} />
	</label>
	<label class="flex flex-col gap-1">
		<span class={labelClasses}>Description</span>
		<textarea name="description" rows="3" class={fieldClasses}>{project.description}</textarea>
	</label>
	<div class="flex flex-wrap gap-4">
		<label class="flex max-w-48 flex-col gap-1">
			<span class={labelClasses}>Status</span>
			<select name="status" value={project.status} class={fieldClasses}>
				{#each projectStatusOrder as statusValue (statusValue)}
					<option value={statusValue}>{projectStatusLabels[statusValue]}</option>
				{/each}
			</select>
		</label>
		<PriorityField priority={project.priority} among="of your board" />
	</div>
	<label class="flex flex-col gap-1">
		<span class={labelClasses}>Repository</span>
		<input name="repositoryUrl" value={project.repositoryUrl} placeholder="https://github.com/..." class={fieldClasses} />
	</label>
	<label class="flex flex-col gap-1">
		<span class={labelClasses}>Live site</span>
		<input name="environmentUrl" value={project.environmentUrl} placeholder="https://..." class={fieldClasses} />
	</label>
	<div class="flex flex-wrap gap-4">
		<label class="flex max-w-48 flex-col gap-1">
			<span class={labelClasses}>Default branch</span>
			<input name="defaultBranch" value={project.defaultBranch} class={fieldClasses} />
		</label>
		<label class="flex max-w-48 flex-col gap-1">
			<span class={labelClasses}>Refactor every … deploys</span>
			<input name="refactorEveryDeploys" type="number" min="0" step="1" value={project.refactorEveryDeploys} class={fieldClasses} />
		</label>
	</div>
	<p class="text-sm text-chalk/50">
		Every push to the default branch counts as a deploy. At the number above a refactor round is raised on this project as the reminder to run it; 0 turns that off.
	</p>
	<ProjectDatabaseFields database={project.database} {fieldClasses} {labelClasses} />
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton
		isSaving={tracker.isSaving}
		class="self-end rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night
			transition hover:brightness-110"
	>
		Save
	</SubmitButton>
</form>
