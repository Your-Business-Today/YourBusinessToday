<script lang="ts">
	import CompanyContextView from '$lib/components/companyContext/CompanyContextView.svelte';
	import EmptyState from '$lib/components/site/EmptyState.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { companyPagePath, registerOfStage } from '$lib/data/salesRegisters';

	let { data } = $props();

	const client = $derived(data.client);
	const register = $derived(registerOfStage(client.stage));
	const crumbs = $derived([
		{ label: register.title, href: register.path },
		{ label: client.name, href: companyPagePath(client) }
	]);
	const notYetMessage = $derived(
		`No company context has been recorded for ${client.name} yet. It appears here once one of their people runs ` +
			'the one prompt from Connect your Claude on their portal and says yes to what their Claude found.'
	);
</script>

<svelte:head>
	<title>Company context — {client.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader {crumbs} title="Company context" />

<div class={workspaceBodyClasses}>
	{#if data.reading === null}
		<EmptyState message={notYetMessage} />
	{:else}
		<CompanyContextView {...data.reading} canMark={false} />
	{/if}
</div>
