<script lang="ts">
	import DocumentProse from '$lib/components/admin/documents/DocumentProse.svelte';
	import FormErrorNote from '$lib/components/site/FormErrorNote.svelte';
	import PackCommentForm from '$lib/components/portal/contract/PackCommentForm.svelte';
	import PackCommentList from '$lib/components/portal/contract/PackCommentList.svelte';
	import PackSignForm from '$lib/components/portal/contract/PackSignForm.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { portalContractPath, portalHomePath } from '$lib/portal/portalPaths';

	let { data, form } = $props();

	const { visitor, document, comments } = $derived(data);
	const signature = $derived(document.signature);
	const crumbs = $derived([
		{ label: visitor.organisationName, href: portalHomePath },
		{ label: 'Your contract', href: portalContractPath }
	]);
	const refusal = $derived(form !== null && 'message' in form ? (form.message as string) : null);
</script>

<svelte:head>
	<title>{document.title} — Your contract — Client portal</title>
</svelte:head>

<WorkspaceHeader {crumbs} title={document.title} />

<div class={workspaceBodyClasses}>
	<p class="text-sm text-chalk-subtle">Version {document.versionNumber}</p>
	<DocumentProse documentHtml={data.documentHtml} />
	<h2 class="font-display text-lg text-chalk">Comments</h2>
	<PackCommentList {comments} />
	<FormErrorNote message={refusal} />
	<PackCommentForm documentId={document.documentId} />
	<h2 class="font-display text-lg text-chalk">Accept and sign</h2>
	{#if signature === null}
		<PackSignForm documentId={document.documentId} versionNumber={document.versionNumber} today={data.today} />
	{:else}
		<p class="text-sm text-chalk/80">
			Signed by {signature.signerName}, {signature.signerPosition}, on {formatBritishDate(signature.signedOn)}, against version {signature.versionNumber}.
		</p>
	{/if}
</div>
