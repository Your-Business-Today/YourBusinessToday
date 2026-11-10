<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { contentPiecePathOf } from './brandKitPageWords';
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { AwaitingPieceRow } from '$lib/brand/projections/contentPiecePage';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { organisationId, pieces }: { organisationId: string; pieces: AwaitingPieceRow[] } = $props();

	const columns: RecordsColumn<AwaitingPieceRow>[] = [
		{ key: 'title', label: 'Piece', sortValue: (piece) => piece.title },
		{ key: 'medium', label: 'For', sortValue: (piece) => piece.medium },
		{ key: 'sent', label: 'Sent', isWideOnly: true, sortValue: (piece) => piece.updatedAt }
	];

	const pathOf = (piece: AwaitingPieceRow) => contentPiecePathOf(organisationId, piece.id);
</script>

<div class="overflow-x-auto">
	<RecordsTable label="Waiting for approval" {columns} rows={pieces} keyOf={(piece) => piece.id} hrefOf={pathOf} emptyMessage="Nothing is waiting for approval.">
		{#snippet cells(piece)}
			<RecordsCell kind="link" href={pathOf(piece)}>{piece.title}</RecordsCell>
			<RecordsCell>{piece.medium}</RecordsCell>
			<RecordsCell isWideOnly>{formatBritishDate(piece.updatedAt)}</RecordsCell>
		{/snippet}
	</RecordsTable>
</div>
