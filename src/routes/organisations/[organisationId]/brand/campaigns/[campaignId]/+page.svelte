<script lang="ts">
	import Button from '$lib/components/site/Button.svelte';
	import CampaignAudienceTable from '$lib/components/brand/CampaignAudienceTable.svelte';
	import CampaignFigureTiles from '$lib/components/brand/CampaignFigureTiles.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import PrintOnPaper from '$lib/components/workspace/PrintOnPaper.svelte';
	import WorkspaceHeader from '$lib/components/workspace/WorkspaceHeader.svelte';
	import { campaignCrumbsFor, noAudienceYet } from '$lib/components/brand/campaignPageWords';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { objectiveLabelOf } from '$lib/brand/campaigns/campaignReportWords';
	import { workspaceBodyClasses } from '$lib/components/workspace/workspaceStyles';

	let { data } = $props();

	const { brandOrganisation: organisation, report } = $derived(data);
	const { campaign } = $derived(report);
	const runs = $derived(`${formatBritishDate(campaign.startsOn)} to ${formatBritishDate(campaign.endsOn)}`);
</script>

<svelte:head>
	<title>{campaign.name} — {organisation.name} — Your Business Today</title>
</svelte:head>

<PrintOnPaper>
	<WorkspaceHeader crumbs={campaignCrumbsFor(organisation)} title={campaign.name}>
		{#snippet actions()}
			<span class="print:hidden"><Button onclick={() => window.print()}>Print or save as PDF</Button></span>
		{/snippet}
		<p class="text-sm text-chalk-muted">
			{organisation.name}’s paid campaign for “{objectiveLabelOf(campaign.objective)}”, {runs}. It is {campaign.status}.
		</p>
	</WorkspaceHeader>

	<div class={`${workspaceBodyClasses} print:gap-3 print:py-3`}>
		<DashboardPanel title="What the money bought" isPadded>
			<CampaignFigureTiles {report} />
		</DashboardPanel>
		<DashboardPanel title="Who it reached">
			{#if report.audienceObservedOn === null}
				<p class="p-6 text-sm text-chalk-subtle">{noAudienceYet}</p>
			{:else}
				<p class="border-b border-hairline px-6 py-3 text-sm text-chalk-muted">
					As the platform reported it on {formatBritishDate(report.audienceObservedOn)}.
				</p>
				<div class="grid gap-0 lg:grid-cols-2 print:grid-cols-2">
					<CampaignAudienceTable label="Reached by age" groupLabel="Age" shares={report.byAgeBand} />
					<CampaignAudienceTable label="Reached by gender" groupLabel="Gender" shares={report.byGender} />
				</div>
			{/if}
		</DashboardPanel>
	</div>
</PrintOnPaper>
