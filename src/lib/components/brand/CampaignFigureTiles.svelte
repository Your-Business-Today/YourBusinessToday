<script lang="ts">
	import StatTile from '$lib/components/workspace/StatTile.svelte';
	import { describeCostPerClick, formatCount, formatPence } from '$lib/brand/campaigns/campaignReportWords';
	import type { CampaignReport } from '$lib/brand/campaigns/campaignReport';

	let { report }: { report: CampaignReport } = $props();

	const { campaign, figures } = $derived(report);
</script>

<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 print:grid-cols-3">
	<StatTile label="Budget" value={formatPence(campaign.budgetPence)} />
	<StatTile label="Spent" value={formatPence(figures.spendPence)} />
	<StatTile label="A click cost" value={describeCostPerClick(report.costPerClickPence)} />
	<StatTile label="Impressions" value={formatCount(figures.impressions)} caption="Times it was shown" />
	<StatTile label="Reach" value={formatCount(figures.reach)} caption="People who saw it" />
	<StatTile label="Clicks" value={formatCount(figures.clicks)} />
</div>
