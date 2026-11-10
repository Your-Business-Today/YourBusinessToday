<script lang="ts">
	import CompanyContextView from '$lib/components/companyContext/CompanyContextView.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { headerButtonClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { portalConnectPath, portalHomePath } from '$lib/portal/portalPaths';

	let { data } = $props();

	const visitor = $derived(data.visitor);
	const crumbs = $derived([{ label: visitor.organisationName, href: portalHomePath }]);
	const notYetMessage =
		'Your company context has not been recorded yet. Connect your Claude and run the one prompt: once you say yes ' +
		'to what it found, your business is drawn here as a map.';
</script>

<svelte:head>
	<title>Your company context — {visitor.organisationName} — Client portal</title>
</svelte:head>

<WorkspaceHeader {crumbs} title="Your company context" />

<div class={workspaceBodyClasses}>
	{#if data.reading === null}
		<EmptyState message={notYetMessage} />
		<a href={portalConnectPath} class={`self-center ${headerButtonClasses}`}>Connect your Claude and run the prompt</a>
	{:else}
		<CompanyContextView {...data.reading} canMark={true} />
	{/if}
</div>
