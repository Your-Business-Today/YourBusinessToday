<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/site/Button.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import DocumentStandingFields from './DocumentStandingFields.svelte';
	import FormField from '$lib/components/site/FormField.svelte';
	import { DocumentLimits, defaultDocumentSection } from '$lib/projectDocuments/documentLimits';
	import { addProjectDocument } from './addProjectDocument';

	const { longestTitle, longestSummary, longestSection, largestMegabytes } = DocumentLimits;

	let errorMessage: string | null = $state(null);
	let isAdding = $state(false);

	async function addDocument(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		isAdding = true;
		errorMessage = await addProjectDocument(form);
		isAdding = false;
		if (errorMessage !== null) return;
		form.reset();
		await invalidateAll();
	}
</script>

<DashboardPanel title="Add a document" isPadded>
	<form onsubmit={addDocument} class="flex flex-col gap-4">
		<FormField label="File" hint={`Markdown reads online; PDF, Word, Excel, PowerPoint, text, CSV or a picture, up to ${largestMegabytes} MB`}>
			<input type="file" name="file" required />
		</FormField>
		<FormField label="Title">
			<input type="text" name="title" required maxlength={longestTitle} />
		</FormField>
		<FormField label="Section" hint={`Such as Product, Asks or How it works; ${defaultDocumentSection} when left empty`}>
			<input type="text" name="section" maxlength={longestSection} />
		</FormField>
		<FormField label="Summary">
			<textarea name="summary" rows="2" maxlength={longestSummary}></textarea>
		</FormField>
		<DocumentStandingFields />
		<FormErrorNote message={errorMessage} />
		<div><Button type="submit" look="primary" isSaving={isAdding} savingLabel="Adding…">Add document</Button></div>
	</form>
</DashboardPanel>
