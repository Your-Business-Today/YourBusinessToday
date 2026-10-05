<script lang="ts">
	import ProjectImagesModal from './ProjectImagesModal.svelte';
	import { headerButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ProjectImage } from '$lib/server/projectImages/projectImageRecord';
	import type { TaskChoice } from '$lib/server/projects/openTaskChoices';

	let {
		images,
		projectId,
		taskChoices
	}: {
		images: (ProjectImage & { uploaderName: string })[];
		projectId: string;
		taskChoices: TaskChoice[];
	} = $props();

	let isModalOpen = $state(false);
</script>

<button type="button" onclick={() => (isModalOpen = true)} class={headerButtonClasses}>
	Images{images.length === 0 ? '' : ` (${images.length})`}
</button>

<ProjectImagesModal {images} {projectId} {taskChoices} bind:isOpen={isModalOpen} />
