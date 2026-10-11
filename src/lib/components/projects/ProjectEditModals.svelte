<script lang="ts">
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import EditProjectForm from './EditProjectForm.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import type { Organisation } from '$lib/server/organisations/organisationRecord';
	import type { ProjectSummary } from '$lib/server/projects/getProjectsForOwner';

	let {
		project,
		organisations,
		isEditModalOpen = $bindable(),
		isDeleteModalOpen = $bindable()
	}: {
		project: ProjectSummary;
		organisations: Organisation[];
		isEditModalOpen: boolean;
		isDeleteModalOpen: boolean;
	} = $props();
</script>

<Modal title={`Edit ${project.name}`} bind:isOpen={isEditModalOpen}>
	<EditProjectForm {project} {organisations} onSaved={() => (isEditModalOpen = false)} />
</Modal>
<DangerConfirmModal
	title="Delete project"
	description={`This permanently deletes “${project.name}”, every task and subtask in it, and all their comments. This cannot be undone.`}
	action="?/deleteProject"
	fields={{ projectId: project.id }}
	submitLabel="Delete project"
	confirmWord={project.name}
	bind:isOpen={isDeleteModalOpen}
/>
