<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { VideoLimits } from '$lib/projectVideos/videoLimits';
	import { panelButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import type { WatchableVideo } from '$lib/projectVideos/projectVideo';

	let { video }: { video: WatchableVideo } = $props();

	const { longestTitle, longestDescription } = VideoLimits;
	const tracker = new FormTracker();

	let isChanging = $state(false);

	$effect(() => {
		if (!isChanging) tracker.reset();
	});
</script>

<div><button type="button" onclick={() => (isChanging = true)} class={panelButtonClasses}>Change title and description</button></div>
<Modal title="Change this video" bind:isOpen={isChanging}>
	<form method="POST" action="?/changeVideo" use:enhance={tracker.submit(() => (isChanging = false))} class="flex flex-col gap-4">
		<input type="hidden" name="videoId" value={video.id} />
		<FormField label="Title" hint="What it shows someone how to do, in a few words">
			<input type="text" name="title" required maxlength={longestTitle} value={video.title} />
		</FormField>
		<FormField label="Description" hint="What the video teaches, in a sentence or two">
			<textarea name="description" rows="4" maxlength={longestDescription} value={video.description}></textarea>
		</FormField>
		<FormErrorNote message={tracker.errorMessage} />
		<div class="flex justify-end"><SubmitButton isSaving={tracker.isSaving}>Save</SubmitButton></div>
	</form>
</Modal>
