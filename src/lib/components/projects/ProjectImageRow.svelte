<script lang="ts">
	import { enhance } from '$app/forms';
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import ImageThumbnail from './ImageThumbnail.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { describeByteCount } from '$lib/data/taskAttachmentRules';
	import { elapsedPhrase } from '$lib/data/elapsedTime';
	import { projectImageHref } from './attachmentLinks';
	import type { ProjectImage } from '$lib/server/projectImages/projectImageRecord';
	import type { TaskChoice } from '$lib/server/projects/openTaskChoices';

	let {
		image,
		projectId,
		taskChoices
	}: { image: ProjectImage & { uploaderName: string }; projectId: string; taskChoices: TaskChoice[] } =
		$props();

	let isRemoveModalOpen = $state(false);

	const tracker = new FormTracker();
	const imageHref = $derived(projectImageHref(projectId, image.id));
</script>

<li class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
	<a href={imageHref} target="_blank" rel="noreferrer" class="shrink-0">
		<ImageThumbnail src={imageHref} alt={image.filename} sizeClasses="h-20 w-20" />
	</a>
	<div class="flex min-w-0 flex-1 flex-col gap-1">
		<p class="truncate font-display text-sm text-chalk">{image.filename}</p>
		<p class="text-xs text-chalk/50">
			{describeByteCount(image.byteCount)}
			· <span class="text-chalk/80">{image.uploaderName}</span>
			· {elapsedPhrase(image.createdAt)}
		</p>
		<form method="POST" action="?/assignImage" use:enhance={tracker.submit()} class="flex gap-2">
			<input type="hidden" name="imageId" value={image.id} />
			<select
				name="taskId"
				required
				aria-label={`Task for “${image.filename}”`}
				class="min-w-0 flex-1 rounded-xl border border-hairline bg-night px-3 py-1.5 text-sm text-chalk"
			>
				<option value="">Assign to a task…</option>
				{#each taskChoices as taskChoice (taskChoice.id)}
					<option value={taskChoice.id}>{taskChoice.title}</option>
				{/each}
			</select>
			<button
				type="submit"
				disabled={tracker.isSaving}
				class="rounded-full border border-go px-4 py-1.5 font-display text-xs text-go transition
					hover:bg-go hover:text-night disabled:opacity-40"
			>
				Assign
			</button>
		</form>
		<FormErrorNote message={tracker.errorMessage} />
	</div>
	<button
		type="button"
		onclick={() => (isRemoveModalOpen = true)}
		aria-label={`Delete “${image.filename}”`}
		class="self-end px-1 text-chalk/40 transition hover:text-signal sm:self-center"
	>
		✕
	</button>
</li>

<DangerConfirmModal
	title="Delete image"
	description={`This permanently deletes “${image.filename}” from the image bank. This cannot be undone.`}
	action="?/deleteImage"
	fields={{ imageId: image.id }}
	submitLabel="Delete image"
	bind:isOpen={isRemoveModalOpen}
/>
