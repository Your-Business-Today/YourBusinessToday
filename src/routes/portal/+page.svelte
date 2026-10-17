<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import HeaderFacts from '$lib/components/workspace/HeaderFacts.svelte';
	import PortalOrganisationSwitch from '$lib/components/portal/PortalOrganisationSwitch.svelte';
	import PortalProjectList from '$lib/components/portal/PortalProjectList.svelte';
	import PortalVisitorCard from '$lib/components/portal/PortalVisitorCard.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { portalConnectPath, portalPeoplePath } from '$lib/portal/siteDoors';
	import { hasSeveralOrganisations } from '$lib/portal/portalVisitor';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const visitor = $derived(data.visitor);
	const peopleFacts = $derived(
		visitor.isAdministrator ? [{ label: 'People', href: portalPeoplePath }] : []
	);
	const connectFact = { label: 'Connect your Claude', href: portalConnectPath };
	const headerFacts = $derived([{ label: 'Client portal' }, connectFact, ...peopleFacts]);
</script>

<svelte:head>
	<title>{visitor.organisationName} — Client portal</title>
</svelte:head>

<WorkspaceHeader crumbs={[]} title={visitor.organisationName}>
	<HeaderFacts facts={headerFacts} />
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<div class={dashboardGridClasses}>
		<PortalProjectList projects={data.projects} />
		<DashboardPanel title="Signed in as">
			<PortalVisitorCard {visitor} />
		</DashboardPanel>
		{#if hasSeveralOrganisations(visitor)}
			<PortalOrganisationSwitch {visitor} />
		{/if}
	</div>
</div>
