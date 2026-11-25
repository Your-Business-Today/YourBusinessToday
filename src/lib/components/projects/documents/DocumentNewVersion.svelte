<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/site/Button.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import Modal from '$lib/components/site/Modal.svelte';
	import { keepNewDocumentVersion } from './newDocumentVersion';
	import { panelButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import type { KeptDocument } from '$lib/projectDocuments/projectDocument';

	let { document }: { document: KeptDocument } = $props();

	let isChoosing = $state(false);
	let isKeeping = $state(false);
	let errorMessage: string | null = $state(null);

	async function keepVersion(event: SubmitEvent) {
		event.preventDefault();
		const file = new FormData(event.currentTarget as HTMLFormElement).get('file');
		isKeeping = true;
		errorMessage = file instanceof File ? await keepNewDocumentVersion(document.id, file) : 'Choose a file to keep as the new version.';
		isKeeping = false;
		if (errorMessage !== null) return;
		isChoosing = false;
		await invalidateAll();
	}
</script>

<button type="button" onclick={() => (isChoosing = true)} class={panelButtonClasses}>New version</button>
<Modal title="Keep a new version" bind:isOpen={isChoosing}>
	<form onsubmit={keepVersion} class="flex flex-col gap-4">
		<FormField label="File" hint={`Version ${document.versionNumber} is kept as it is; this becomes version ${document.versionNumber + 1}`}>
			<input type="file" name="file" required />
		</FormField>
		<FormErrorNote message={errorMessage} />
		<div class="flex justify-end"><Button type="submit" look="primary" isSaving={isKeeping} savingLabel="Keeping…">Keep version</Button></div>
	</form>
</Modal>
