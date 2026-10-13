<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import HeaderFacts from '$lib/components/workspace/HeaderFacts.svelte';
	import PortalVisitorCard from '$lib/components/portal/PortalVisitorCard.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

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
	<DashboardPanel title="Signed in as" class="max-w-xl">
		<PortalVisitorCard {visitor} />
	</DashboardPanel>
</div>
