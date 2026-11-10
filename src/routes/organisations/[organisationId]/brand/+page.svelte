<script lang="ts">
	import BrandAwaitingTable from '$lib/components/brand/BrandAwaitingTable.svelte';
	import BrandCampaignTable from '$lib/components/brand/BrandCampaignTable.svelte';
	import BrandChannelTable from '$lib/components/brand/BrandChannelTable.svelte';
	import BrandKitList from '$lib/components/brand/BrandKitList.svelte';
	import BrandSwatches from '$lib/components/brand/BrandSwatches.svelte';
	import Button from '$lib/components/site/Button.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { brandKitCrumbsFor, nothingDecidedYet, starterKindsOffered } from '$lib/components/brand/brandKitPageWords';
	import { brandLibraryPathOf } from '$lib/brand/library/libraryWords';
	import { contentPlanPathOf } from '$lib/components/brand/contentPlanPageWords';
	import { dashboardGridClasses, workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { brandOrganisation: organisation, kit, awaitingApproval, campaigns } = $derived(data);
</script>

<svelte:head>
	<title>Brand kit — {organisation.name} — Your Business Today</title>
</svelte:head>

<WorkspaceHeader crumbs={brandKitCrumbsFor(organisation)} title="Brand kit">
	{#snippet actions()}
		<Button href={contentPlanPathOf(organisation.id)}>The month’s plan</Button>
		<Button href={brandLibraryPathOf(organisation.id)}>Photos and videos</Button>
	{/snippet}
	<p class="text-sm text-chalk-muted">
		{organisation.name}’s brand as it holds everywhere, and why each part was decided. Your Claude changes it through the
		Your Business Today connector; this page shows it.
	</p>
</WorkspaceHeader>

<div class={workspaceBodyClasses}>
	<div class={dashboardGridClasses}>
		<div class="flex min-w-0 flex-col gap-6">
			<DashboardPanel title="Waiting for approval" count={awaitingApproval.length}>
				<BrandAwaitingTable organisationId={organisation.id} pieces={awaitingApproval} />
			</DashboardPanel>
			<DashboardPanel title="Palette" isPadded>
				<BrandSwatches entries={kit.palette} emptyMessage={nothingDecidedYet} />
			</DashboardPanel>
			<DashboardPanel title="Type" isPadded>
				<BrandKitList entries={kit.type} emptyMessage={nothingDecidedYet} />
			</DashboardPanel>
			<DashboardPanel title="Spacing, corners and motion" isPadded>
				<BrandKitList entries={kit.spacingAndShape} emptyMessage={nothingDecidedYet} />
			</DashboardPanel>
			<DashboardPanel title="Set for one channel">
				<BrandChannelTable entries={kit.forOneChannel} />
			</DashboardPanel>
			<DashboardPanel title="Paid campaigns" count={campaigns.length}>
				<BrandCampaignTable organisationId={organisation.id} {campaigns} />
			</DashboardPanel>
		</div>
		<aside class="flex min-w-0 flex-col gap-6">
			<DashboardPanel title="Tone of voice" isPadded>
				<BrandKitList entries={kit.voice} emptyMessage={nothingDecidedYet} />
			</DashboardPanel>
			<DashboardPanel title="Kinds of post" isPadded>
				<BrandKitList entries={kit.postKinds} emptyMessage={starterKindsOffered} />
			</DashboardPanel>
			<DashboardPanel title="Never say" isPadded>
				<BrandKitList entries={kit.neverSay} emptyMessage={nothingDecidedYet} />
			</DashboardPanel>
			<DashboardPanel title="Audience" isPadded>
				<BrandKitList entries={kit.audience} emptyMessage={nothingDecidedYet} />
			</DashboardPanel>
		</aside>
	</div>
</div>
