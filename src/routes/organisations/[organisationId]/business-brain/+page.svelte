<script lang="ts">
	import BusinessBrainChatbotsPanel from '$lib/components/businessBrain/BusinessBrainChatbotsPanel.svelte';
	import BusinessBrainFilesPanel from '$lib/components/businessBrain/BusinessBrainFilesPanel.svelte';
	import BusinessBrainIndexPanel from '$lib/components/businessBrain/BusinessBrainIndexPanel.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { businessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import { businessBrainCrumbs } from '$lib/components/businessBrain/businessBrainCrumbs';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { organisation, canManage, index, chatbots, keptFiles } = $derived(data);
	const addresses = $derived(businessBrainAddresses(organisation.id));
	const hasUnnamedFiles = $derived(keptFiles.unnamedCount > 0);
</script>

<svelte:head>
	<title>Your Business Brain — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={businessBrainCrumbs(organisation)} title="Your Business Brain">
	<p class="text-sm text-chalk-muted">
		What {organisation.name} knows, filed by your Claude through the connector. This page is for reading.
	</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<div class={dashboardGridClasses}>
		<div class="flex min-w-0 flex-col gap-4">
			<BusinessBrainIndexPanel {index} {addresses} />
		</div>
		<aside class="flex min-w-0 flex-col gap-4">
			<BusinessBrainChatbotsPanel {chatbots} {canManage} {addresses} />
			{#if hasUnnamedFiles}
				<BusinessBrainFilesPanel
					title="Files no page names yet"
					files={keptFiles.unnamed}
					fileCount={keptFiles.unnamedCount}
					{addresses}
				/>
			{/if}
		</aside>
	</div>
</div>
