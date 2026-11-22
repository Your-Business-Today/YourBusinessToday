<script lang="ts">
	import { enhance } from '$app/forms';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import SubmitButton from '$lib/components/site/SubmitButton.svelte';
	import { DocumentLimits } from '$lib/projectDocuments/documentLimits';
	import { FormTracker } from '$lib/client/formTracker.svelte';
	import { panelButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ProjectDocument } from '$lib/projectDocuments/projectDocument';

	let { document }: { document: ProjectDocument } = $props();

	const { longestTitle, longestSummary } = DocumentLimits;
	const tracker = new FormTracker();

	let isChanging = $state(false);

	$effect(() => {
		if (!isChanging) tracker.reset();
	});
</script>

<button type="button" onclick={() => (isChanging = true)} class={panelButtonClasses}>Change</button>
<Modal title="Change this document" bind:isOpen={isChanging}>
	<form method="POST" action="?/changeDocument" use:enhance={tracker.submit(() => (isChanging = false))} class="flex flex-col gap-4">
		<input type="hidden" name="documentId" value={document.id} />
		<FormField label="Title" hint="What it is, in a few words">
			<input type="text" name="title" required maxlength={longestTitle} value={document.title} />
		</FormField>
		<FormField label="Summary" hint="What the document is about, in a sentence or two">
			<textarea name="summary" rows="4" maxlength={longestSummary} value={document.summary}></textarea>
		</FormField>
		<FormErrorNote message={tracker.errorMessage} />
		<div class="flex justify-end"><SubmitButton isSaving={tracker.isSaving}>Save</SubmitButton></div>
	</form>
</Modal>
