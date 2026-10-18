<script lang="ts">
	import HeaderFacts from '$lib/components/workspace/HeaderFacts.svelte';
	import PortalInviteForm from '$lib/components/portal/PortalInviteForm.svelte';
	import PortalPeopleList from '$lib/components/portal/PortalPeopleList.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { portalHomePath } from '$lib/portal/portalPaths';

	let { data } = $props();

	const visitor = $derived(data.visitor);
	const crumbs = $derived([{ label: visitor.organisationName, href: portalHomePath }]);
	const headerFacts = $derived([
		{ label: visitor.isAdministrator ? 'You are an administrator' : 'Ask an administrator to make changes' }
	]);
</script>

<svelte:head>
	<title>People — {visitor.organisationName} — Client portal</title>
</svelte:head>

<WorkspaceHeader {crumbs} title="People">
	<HeaderFacts facts={headerFacts} />
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<div class={dashboardGridClasses}>
		<PortalPeopleList people={data.people} {visitor} />
		{#if visitor.isAdministrator}
			<PortalInviteForm />
		{/if}
	</div>
</div>
