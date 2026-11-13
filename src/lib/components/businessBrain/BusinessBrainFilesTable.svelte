<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { describeByteCount } from '$lib/data/taskAttachmentRules';
	import { formatBritishDate } from '$lib/data/britishDate';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { ListedBusinessBrainFile } from '$lib/server/businessBrain/readListedBusinessBrainFiles';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { files, addresses }: { files: ListedBusinessBrainFile[]; addresses: BusinessBrainAddresses } = $props();

	const columns: RecordsColumn<ListedBusinessBrainFile>[] = [
		{ key: 'filename', label: 'File', sortValue: (file) => file.filename },
		{ key: 'named', label: 'Named by a page', sortValue: (file) => Number(file.isNamedByPage) },
		{ key: 'size', label: 'Size', isFigure: true, isWideOnly: true, sortValue: (file) => file.byteCount },
		{ key: 'filed', label: 'Filed', isWideOnly: true, sortValue: (file) => file.recordedAt }
	];
	const emptyMessage = 'No file is kept yet. Your Claude keeps the files a page is written from when it files the page.';
</script>

<RecordsTable label="Files" {columns} rows={files} keyOf={(file) => file.fileId} isCardsOnPhone {emptyMessage}>
	{#snippet cells(file)}
		<RecordsCell kind="link">
			<a href={addresses.file(file.fileId)} target="_blank" rel="noreferrer" class="hover:underline">{file.filename}</a>
		</RecordsCell>
		<RecordsCell kind="status" label="Named by a page">
			{#if file.isNamedByPage}
				<Badge label="Named" tone="positive" />
			{:else}
				<Badge label="No page names it yet" tone="warning" />
			{/if}
		</RecordsCell>
		<RecordsCell kind="figure" isWideOnly>{describeByteCount(file.byteCount)}</RecordsCell>
		<RecordsCell isWideOnly>{formatBritishDate(file.recordedAt)}</RecordsCell>
	{/snippet}
</RecordsTable>
