<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import HeaderFacts from '$lib/components/workspace/HeaderFacts.svelte';
	import PortalProjectList from '$lib/components/portal/PortalProjectList.svelte';
	import PortalVisitorCard from '$lib/components/portal/PortalVisitorCard.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const headerFacts = [{ label: 'Client portal' }];
	const visitor = $derived(data.visitor);
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
	</div>
</div>
