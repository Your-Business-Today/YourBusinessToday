<script lang="ts">
	import BrandLibraryForm from '$lib/components/brand/BrandLibraryForm.svelte';
	import BrandLibraryTable from '$lib/components/brand/BrandLibraryTable.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { brandCrumbsFor } from '$lib/components/brand/brandKitPageWords';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';
	import { moreThanListed, noBrandYet } from '$lib/components/brand/brandLibraryPageWords';

	let { data } = $props();

	const { brandOrganisation: organisation, hasBrand, items, keptCount, today } = $derived(data);
	const cutNote = $derived(moreThanListed(keptCount));
</script>

<svelte:head>
	<title>Photos and videos — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={brandCrumbsFor(organisation)} title="Photos and videos">
	<p class="text-sm text-chalk-muted">
		{organisation.name}’s own photos and videos, each with what it shows and whether it may be posted. Real work is used before
		stock pictures, and nothing goes out without permission. Only people on {organisation.name} with Brand can see them.
	</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<div class={dashboardGridClasses}>
		<DashboardPanel title="Library" count={keptCount}>
			<BrandLibraryTable {items} />
			{#if cutNote !== null}
				<p class="border-t border-hairline px-6 py-3 text-sm text-chalk-subtle">{cutNote}</p>
			{/if}
		</DashboardPanel>
		<DashboardPanel title="Add a photo or video" isPadded>
			{#if hasBrand}
				<BrandLibraryForm {today} />
			{:else}
				<p class="text-sm text-chalk-subtle">{noBrandYet}</p>
			{/if}
		</DashboardPanel>
	</div>
</div>
