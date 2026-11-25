<script lang="ts">
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import PortalPackDocumentList from '$lib/components/portal/contract/PortalPackDocumentList.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { portalHomePath } from '$lib/portal/portalPaths';

	let { data } = $props();

	const { visitor, pack } = $derived(data);
	const crumbs = $derived([{ label: visitor.organisationName, href: portalHomePath }]);
	const noPack = 'Your Business Today has not sent your organisation a contract to sign yet. When it does, it shows here.';
</script>

<svelte:head>
	<title>Your contract — {visitor.organisationName} — Client portal</title>
</svelte:head>

<WorkspaceHeader {crumbs} title="Your contract" />

<div class={workspaceBodyClasses}>
	{#if pack === null}
		<EmptyState message={noPack} />
	{:else}
		<p class="text-sm text-chalk-subtle">
			Read each document, comment on any clause you want to discuss, and sign each one when you are happy with it.
		</p>
		<PortalPackDocumentList documents={pack.documents} />
	{/if}
</div>
