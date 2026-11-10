<script lang="ts">
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import MeetingStageBadge from './MeetingStageBadge.svelte';
	import { boardMeetingColumns } from './boardMeetingColumns';
	import { boardMeetingPathOf } from '$lib/data/boardroomPaths';
	import { bodyCellClasses, cellKindClasses, wideOnlyCellClasses } from '$lib/components/workspace/recordsTableStyles';
	import type { BoardMeetingRow } from '$lib/data/boardMeetingRows';

	let { organisationId, meetings }: { organisationId: string; meetings: BoardMeetingRow[] } = $props();

	const emptyMessage = 'No board meeting has been called yet. Call the first one here, or through your Claude.';
</script>

<RecordsTable
	label="Board meetings"
	columns={boardMeetingColumns}
	rows={meetings}
	keyOf={(row) => row.id}
	hrefOf={(row) => boardMeetingPathOf(organisationId, row.id)}
	{emptyMessage}
>
	{#snippet cells(row)}
		<td class={[bodyCellClasses, cellKindClasses.link]}>
			<a href={boardMeetingPathOf(organisationId, row.id)} class="hover:text-go">{row.when}</a>
		</td>
		<td class={[bodyCellClasses, cellKindClasses.status]}><MeetingStageBadge stage={row.stage} /></td>
		<td class={[bodyCellClasses, cellKindClasses.text, wideOnlyCellClasses]}>{row.chairName}</td>
		<td class={[bodyCellClasses, cellKindClasses.figure, wideOnlyCellClasses]}>{row.itemCount}</td>
	{/snippet}
</RecordsTable>
