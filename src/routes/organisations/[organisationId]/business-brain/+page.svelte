<script lang="ts">
	import BusinessBrainBody from '$lib/components/businessBrain/BusinessBrainBody.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { businessBrainCrumbs } from '$lib/components/businessBrain/businessBrainCrumbs';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { organisation, brain } = $derived(data);
</script>

<svelte:head>
	<title>Your Business Brain — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={businessBrainCrumbs(organisation)} title="Your Business Brain">
	<p class="text-sm text-chalk-muted">What {organisation.name} knows, filed by your Claude through the connector.</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<BusinessBrainBody organisationId={organisation.id} {brain} />
</div>
