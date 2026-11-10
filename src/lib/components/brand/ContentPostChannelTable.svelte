<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import ContentStageBadge from './ContentStageBadge.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { contentPiecePathOf } from './brandKitPageWords';
	import { noCaptionYet, thisChannel } from './contentPostWords';
	import type { PostChannelRow } from '$lib/brand/projections/contentPiecePage';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { organisationId, channels }: { organisationId: string; channels: PostChannelRow[] } = $props();

	const columns: RecordsColumn<PostChannelRow>[] = [
		{ key: 'medium', label: 'Channel' },
		{ key: 'stage', label: 'Status' },
		{ key: 'caption', label: 'Caption' }
	];
</script>

<RecordsTable label="Channels of this post" {columns} rows={channels} keyOf={(row) => row.id} isDense>
	{#snippet cells(row)}
		{#if row.isThisPiece}
			<RecordsCell>{row.medium} <Badge label={thisChannel} /></RecordsCell>
		{:else}
			<RecordsCell kind="link" href={contentPiecePathOf(organisationId, row.id)}>{row.medium}</RecordsCell>
		{/if}
		<RecordsCell kind="status"><ContentStageBadge stage={row.stage} /></RecordsCell>
		<RecordsCell><span class="whitespace-pre-line">{row.caption === '' ? noCaptionYet : row.caption}</span></RecordsCell>
	{/snippet}
</RecordsTable>
