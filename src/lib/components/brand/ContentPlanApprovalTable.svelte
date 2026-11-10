<script lang="ts">
	import ContentPlanApprovalChannels from './ContentPlanApprovalChannels.svelte';
	import ContentPlanApprovalPicture from './ContentPlanApprovalPicture.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { approvalPanelTitle } from './contentApprovalWords';
	import { contentPiecePathOf } from './brandKitPageWords';
	import { noKindYet } from '$lib/brand/plan/planCounts';
	import { pictureColumn } from './postPictureWords';
	import type { ApprovalPostRow } from '$lib/brand/approval/monthApprovalPage';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { organisationId, posts }: { organisationId: string; posts: ApprovalPostRow[] } = $props();

	const columns: RecordsColumn<ApprovalPostRow>[] = [
		{ key: 'day', label: 'Goes live' },
		{ key: 'title', label: 'Post' },
		{ key: 'kind', label: 'Kind', isWideOnly: true },
		{ key: 'channels', label: 'Channels and words' },
		{ key: 'picture', label: pictureColumn }
	];

	function pathOf(post: ApprovalPostRow): string {
		const [firstChannel] = post.channels;
		return contentPiecePathOf(organisationId, firstChannel.id);
	}
</script>

<div class="overflow-x-auto">
	<RecordsTable label={approvalPanelTitle} {columns} rows={posts} keyOf={(post) => post.postId}>
		{#snippet cells(post)}
			<RecordsCell kind="status">{post.dayLabel} {post.time}</RecordsCell>
			<RecordsCell kind="link" href={pathOf(post)}>{post.title}</RecordsCell>
			<RecordsCell isWideOnly>{post.kind ?? noKindYet}</RecordsCell>
			<RecordsCell><ContentPlanApprovalChannels {organisationId} channels={post.channels} /></RecordsCell>
			<RecordsCell><ContentPlanApprovalPicture pictures={post.pictures} /></RecordsCell>
		{/snippet}
	</RecordsTable>
</div>
