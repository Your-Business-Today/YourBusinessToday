<script lang="ts">
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import PortalRequestRow from './PortalRequestRow.svelte';
	import { panelEmptyClasses, panelListClasses } from '$lib/components/workspace/workspaceStyles';
	import type { PortalRequest } from '$lib/portal/portalRequest';

	let { requests }: { requests: PortalRequest[] } = $props();
</script>

<DashboardPanel title="Your requests" count={requests.length}>
	{#if requests.length === 0}
		<p class={panelEmptyClasses}>You have not raised a request on this project yet.</p>
	{/if}
	{#if requests.length > 0}
		<ul class={panelListClasses}>
			{#each requests as request (request.id)}
				<PortalRequestRow {request} />
			{/each}
		</ul>
	{/if}
</DashboardPanel>
