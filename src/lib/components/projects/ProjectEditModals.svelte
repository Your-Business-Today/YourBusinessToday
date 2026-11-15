<script lang="ts">
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import { deletionWarningFor } from '$lib/data/projectDeletion';
	import EditProjectForm from './EditProjectForm.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import type { ShownPosition } from '$lib/data/shownIds';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';
	import type { ProjectSummary } from '$lib/server/projects/getProjectsForOwner';

	let {
		project,
		organisations,
		boardPlace,
		isEditModalOpen = $bindable(),
		isDeleteModalOpen = $bindable()
	}: {
		project: ProjectSummary;
		organisations: Organisation[];
		boardPlace: ShownPosition;
		isEditModalOpen: boolean;
		isDeleteModalOpen: boolean;
	} = $props();
</script>

<Modal title={`Edit ${project.name}`} bind:isOpen={isEditModalOpen}>
	<EditProjectForm {project} {organisations} {boardPlace} onSaved={() => (isEditModalOpen = false)} />
</Modal>
<DangerConfirmModal
	title="Delete project"
	description={deletionWarningFor(project.name)}
	action="?/deleteProject"
	fields={{ projectId: project.id }}
	submitLabel="Delete project"
	confirmWord={project.name}
	bind:isOpen={isDeleteModalOpen}
/>
