<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import LibraryPreview from './LibraryPreview.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { postingReasonOf } from '$lib/brand/library/libraryWords';
	import { formatBritishDate } from '$lib/data/britishDate';
	import { libraryIsEmpty, postingBadgeOf, type LibraryPageItem } from './brandLibraryPageWords';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { items }: { items: LibraryPageItem[] } = $props();

	const columns: RecordsColumn<LibraryPageItem>[] = [
		{ key: 'preview', label: 'Photo or video' },
		{ key: 'shows', label: 'What it shows', sortValue: (item) => item.shows },
		{ key: 'takenOn', label: 'Taken', sortValue: (item) => item.takenOn },
		{ key: 'posting', label: 'Posting', sortValue: (item) => item.posting },
		{ key: 'added', label: 'Added', isWideOnly: true, sortValue: (item) => item.recordedAt }
	];
</script>

<div class="overflow-x-auto">
	<RecordsTable label="Photos and videos" {columns} rows={items} keyOf={(item) => item.id} emptyMessage={libraryIsEmpty}>
		{#snippet cells(item)}
			<RecordsCell><LibraryPreview {item} /></RecordsCell>
			<RecordsCell>{item.shows}</RecordsCell>
			<RecordsCell kind="status">{formatBritishDate(item.takenOn)}</RecordsCell>
			<RecordsCell>
				<Badge {...postingBadgeOf(item)} />
				<span class="mt-1 block text-xs text-chalk-faint">{postingReasonOf(item)}</span>
			</RecordsCell>
			<RecordsCell isWideOnly>{item.addedByName}, {formatBritishDate(item.recordedAt)}</RecordsCell>
		{/snippet}
	</RecordsTable>
</div>
