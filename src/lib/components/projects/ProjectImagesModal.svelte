<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import ProjectImageRow from './ProjectImageRow.svelte';
	import { imageFileAccept, projectImageLimitDescription } from '$lib/data/projectImageRules';
	import { panelButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import { uploadProjectImages } from './uploadProjectImages';
	import type { ProjectImage } from '$lib/server/projectImages/projectImageRecord';
	import type { TaskChoice } from '$lib/server/projects/openTaskChoices';

	let {
		images,
		projectId,
		taskChoices,
		isOpen = $bindable()
	}: {
		images: (ProjectImage & { uploaderName: string })[];
		projectId: string;
		taskChoices: TaskChoice[];
		isOpen: boolean;
	} = $props();

	let fileInput = $state<HTMLInputElement | null>(null);
	let uploadingLabel = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);

	async function uploadChosenImages(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const files = Array.from(input.files ?? []);
		input.value = '';
		errorMessage = await uploadProjectImages(files, (label) => (uploadingLabel = label));
		uploadingLabel = null;
		await invalidateAll();
	}
</script>

<Modal title="Image bank" maxWidthClass="max-w-3xl" bind:isOpen>
	<div class="flex flex-col gap-4">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<p class="max-w-md text-sm text-chalk/60">
				Images waiting for a task. Claude can find them here and put them on the tasks it raises,
				or assign one yourself. {projectImageLimitDescription()}
			</p>
			<input
				bind:this={fileInput}
				type="file"
				accept={imageFileAccept}
				multiple
				onchange={uploadChosenImages}
				class="hidden"
			/>
			<button
				type="button"
				disabled={uploadingLabel !== null}
				onclick={() => fileInput?.click()}
				class={`max-w-xs truncate ${panelButtonClasses}`}
			>
				{uploadingLabel ?? '＋ Upload images'}
			</button>
		</div>
		<FormErrorNote message={errorMessage} />
		{#if images.length === 0}
			<p class="text-sm text-chalk/60">No unassigned images.</p>
		{:else}
			<ul class="flex flex-col divide-y divide-hairline">
				{#each images as image (image.id)}
					<ProjectImageRow {image} {projectId} {taskChoices} />
				{/each}
			</ul>
		{/if}
	</div>
</Modal>
