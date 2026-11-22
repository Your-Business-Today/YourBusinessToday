<script lang="ts">
	import DangerConfirmModal from '$lib/components/site/DangerConfirmModal.svelte';
	import { panelButtonClasses } from '$lib/components/workspace/workspaceStyles';
	import type { ProjectDocument } from '$lib/projectDocuments/projectDocument';

	let { document }: { document: ProjectDocument } = $props();

	let isConfirming = $state(false);
</script>

<button type="button" onclick={() => (isConfirming = true)} class={panelButtonClasses}>Remove</button>
<DangerConfirmModal
	title="Remove this document?"
	description={`"${document.title}" and its file come off the project for everyone on it, for good.`}
	action="?/deleteDocument"
	fields={{ documentId: document.id }}
	submitLabel="Remove document"
	savingLabel="Removing…"
	bind:isOpen={isConfirming}
/>
