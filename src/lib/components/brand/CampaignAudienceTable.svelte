<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { formatCount, formatShare } from '$lib/brand/campaigns/campaignReportWords';
	import type { AudienceShare } from '$lib/brand/audience/audienceBreakdown';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { label, groupLabel, shares }: { label: string; groupLabel: string; shares: AudienceShare[] } = $props();

	const columns: RecordsColumn<AudienceShare>[] = $derived([
		{ key: 'group', label: groupLabel },
		{ key: 'reach', label: 'Reached', isFigure: true, sortValue: (share) => share.reach },
		{ key: 'share', label: 'Of everyone', isFigure: true, sortValue: (share) => share.shareOfReach },
		{ key: 'clicks', label: 'Clicked', isFigure: true, sortValue: (share) => share.clicks }
	]);
</script>

<RecordsTable {label} {columns} rows={shares} keyOf={(share) => share.key} isDense emptyMessage="Nobody recorded yet.">
	{#snippet cells(share)}
		<RecordsCell>{share.label}</RecordsCell>
		<RecordsCell kind="figure">{formatCount(share.reach)}</RecordsCell>
		<RecordsCell kind="figure">{formatShare(share.shareOfReach)}</RecordsCell>
		<RecordsCell kind="figure">{formatCount(share.clicks)}</RecordsCell>
	{/snippet}
</RecordsTable>
