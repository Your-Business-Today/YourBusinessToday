<script lang="ts">
	import { fieldClasses } from '$lib/components/site/formStyles';
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import OrganisationSelect from '$lib/components/organisations/OrganisationSelect.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import PriorityField from '$lib/components/site/PriorityField.svelte';
	import ProjectDatabaseFields from './ProjectDatabaseFields.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { projectStatusLabels, projectStatusOrder } from '$lib/data/projectStatus';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';
	import type { Project } from '$lib/server/projects/projectRecord';
	import SmallCapsField from '$lib/components/site/SmallCapsField.svelte';

	let {
		project,
		organisations,
		onSaved
	}: { project: Project; organisations: Organisation[]; onSaved: () => void } = $props();

	const tracker = new FormTracker();
</script>

<form
	method="POST"
	action="?/updateProject"
	use:enhance={tracker.submit(onSaved)}
	class="flex flex-col gap-4"
>
	<input type="hidden" name="projectId" value={project.id} />
	<SmallCapsField label="Name">
		<input name="name" required value={project.name} class={fieldClasses} />
	</SmallCapsField>
	<SmallCapsField label="Description">
		<textarea name="description" rows="3" class={fieldClasses}>{project.description}</textarea>
	</SmallCapsField>
	<div class="flex flex-wrap gap-4">
		<SmallCapsField label="Status" class="max-w-48">
			<select name="status" value={project.status} class={fieldClasses}>
				{#each projectStatusOrder as statusValue (statusValue)}
					<option value={statusValue}>{projectStatusLabels[statusValue]}</option>
				{/each}
			</select>
		</SmallCapsField>
		<PriorityField priority={project.priority} among="of your board" />
	</div>
	<OrganisationSelect
		{organisations}
		selectedOrganisationId={project.organisationId}
	/>
	<SmallCapsField label="Repository">
		<input name="repositoryUrl" value={project.repositoryUrl} placeholder="https://github.com/..." class={fieldClasses} />
	</SmallCapsField>
	<SmallCapsField label="Live site">
		<input name="environmentUrl" value={project.environmentUrl} placeholder="https://..." class={fieldClasses} />
	</SmallCapsField>
	<div class="flex flex-wrap gap-4">
		<SmallCapsField label="Default branch" class="max-w-48">
			<input name="defaultBranch" value={project.defaultBranch} class={fieldClasses} />
		</SmallCapsField>
		<SmallCapsField label="Refactor every … deploys" class="max-w-48">
			<input name="refactorEveryDeploys" type="number" min="0" step="1" value={project.refactorEveryDeploys} class={fieldClasses} />
		</SmallCapsField>
	</div>
	<p class="text-sm text-chalk/50">
		Every push to the default branch counts as a deploy. At the number above a refactor round is raised on this project as the reminder to run it; 0 turns that off.
	</p>
	<ProjectDatabaseFields database={project.database} />
	<FormErrorNote message={tracker.errorMessage} />
	<SubmitButton
		isSaving={tracker.isSaving}
		class="self-end rounded-full bg-go px-6 py-2.5 font-display text-sm font-medium text-night
			transition hover:brightness-110"
	>
		Save
	</SubmitButton>
</form>
