<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { campaignPagePath, formatPence } from '$lib/brand/campaigns/campaignReportWords';
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { CampaignHead } from '$lib/brand/campaigns/campaign';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { organisationId, campaigns }: { organisationId: string; campaigns: CampaignHead[] } = $props();

	const columns: RecordsColumn<CampaignHead>[] = [
		{ key: 'name', label: 'Campaign', sortValue: (campaign) => campaign.name },
		{ key: 'status', label: 'Stands at', sortValue: (campaign) => campaign.status },
		{ key: 'dates', label: 'Runs', isWideOnly: true, sortValue: (campaign) => campaign.startsOn },
		{ key: 'budget', label: 'Budget', isFigure: true, sortValue: (campaign) => campaign.budgetPence }
	];

	const pageOf = (campaign: CampaignHead) => campaignPagePath(organisationId, campaign.id);
</script>

<div class="overflow-x-auto">
	<RecordsTable label="Campaigns" {columns} rows={campaigns} keyOf={(campaign) => campaign.id} hrefOf={pageOf} emptyMessage="No campaigns yet.">
		{#snippet cells(campaign)}
			<RecordsCell kind="link" href={pageOf(campaign)}>{campaign.name}</RecordsCell>
			<RecordsCell kind="status">{campaign.status}</RecordsCell>
			<RecordsCell isWideOnly>{formatBritishDate(campaign.startsOn)} to {formatBritishDate(campaign.endsOn)}</RecordsCell>
			<RecordsCell kind="figure">{formatPence(campaign.budgetPence)}</RecordsCell>
		{/snippet}
	</RecordsTable>
</div>
