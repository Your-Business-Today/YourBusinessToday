<script lang="ts">
	import DocumentAddForm from '$lib/components/projects/documents/DocumentAddForm.svelte';
	import DocumentShelf from '$lib/components/projects/documents/DocumentShelf.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const documentsTitle = 'Documents';
	const { pageOwner, documents } = $derived(data);
	const ownerName = $derived(pageOwner.name);
</script>

<svelte:head>
	<title>{documentsTitle} — {ownerName} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={documentsTitle}>
	<p class="text-sm text-chalk-subtle">
		{ownerName}’s own documents, outputs first. Every change is kept as a version, and your Claude can ask someone on the team for their input.
	</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<div class={dashboardGridClasses}>
		<DocumentShelf {documents} {ownerName} />
		<DocumentAddForm />
	</div>
</div>
