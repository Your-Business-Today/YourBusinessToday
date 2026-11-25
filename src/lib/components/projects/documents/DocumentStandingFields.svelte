<script lang="ts">
	import FormField from '$lib/components/site/FormField.svelte';
	import { documentFlows, documentStatuses, documentStatusWords, defaultDocumentFlow, defaultDocumentStatus } from '$lib/projectDocuments/documentStanding';
	import type { DocumentFlow, DocumentStatus } from '$lib/projectDocuments/documentStanding';

	let { status = defaultDocumentStatus, flow = defaultDocumentFlow }: { status?: DocumentStatus; flow?: DocumentFlow } = $props();

	const flowChoiceWords: Record<DocumentFlow, string> = { output: 'Output — what was made', input: 'Input — material that came in' };
</script>

<FormField label="Status" hint="A draft is worked on by the team; each change is kept as a version">
	<select name="status" value={status}>
		{#each documentStatuses as choice (choice)}
			<option value={choice}>{documentStatusWords[choice]}</option>
		{/each}
	</select>
</FormField>
<FormField label="Input or output">
	<select name="flow" value={flow}>
		{#each documentFlows as choice (choice)}
			<option value={choice}>{flowChoiceWords[choice]}</option>
		{/each}
	</select>
</FormField>
