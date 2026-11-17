<script lang="ts">
	import PersonLine from '$lib/components/workspace/PersonLine.svelte';
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import { describeByteCount } from '$lib/data/taskAttachmentRules';
	import { formatUkDateTime } from '$lib/data/britishDate';
	import type { OrganisationExportRecord } from '$lib/server/organisationExport/organisationExportRecord';
	import type { OrganisationMember } from '$lib/server/organisations/organisationMemberRecord';

	let { record, members }: { record: OrganisationExportRecord; members: OrganisationMember[] } = $props();

	const exporter = $derived(members.find((member) => member.id === record.exportedBy));
	const exporterName = $derived(exporter?.name ?? 'Your Business Today');
	const held = $derived(`${record.rowCount} rows, ${record.fileCount} files, ${describeByteCount(record.byteCount)}`);
</script>

<RecordsCell kind="link">{formatUkDateTime(record.exportedAt)}</RecordsCell>
<RecordsCell label="By"><PersonLine name={exporterName} /></RecordsCell>
<RecordsCell label="What it held">{held}</RecordsCell>
