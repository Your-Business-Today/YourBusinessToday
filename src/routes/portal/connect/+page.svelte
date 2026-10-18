<script lang="ts">
	import PortalClaudeAbilities from '$lib/components/portal/PortalClaudeAbilities.svelte';
	import PortalClaudePlanSteps from '$lib/components/portal/PortalClaudePlanSteps.svelte';
	import PortalConnectorAddress from '$lib/components/portal/PortalConnectorAddress.svelte';
	import PortalOnboardingPrompt from '$lib/components/portal/PortalOnboardingPrompt.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { portalHomePath } from '$lib/portal/portalPaths';

	let { data } = $props();

	const visitor = $derived(data.visitor);
	const crumbs = $derived([{ label: visitor.organisationName, href: portalHomePath }]);
</script>

<svelte:head>
	<title>Connect your Claude — {visitor.organisationName} — Client portal</title>
</svelte:head>

<WorkspaceHeader {crumbs} title="Connect your Claude" />

<div class={workspaceBodyClasses}>
	<div class={dashboardGridClasses}>
		<PortalConnectorAddress address={data.connectorAddress} />
		<PortalClaudeAbilities />
		<PortalClaudePlanSteps />
		{#if data.isOnboarding}
			<PortalOnboardingPrompt />
		{/if}
	</div>
</div>
