<script lang="ts">
	import FiledEmailCells from './FiledEmailCells.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import type { FiledEmail } from '$lib/data/filedEmailRules';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { emails }: { emails: FiledEmail[] } = $props();

	const columns: RecordsColumn<FiledEmail>[] = [
		{ key: 'sentAt', label: 'When', sortValue: (email) => email.sentAt },
		{ key: 'direction', label: 'In or out', isWideOnly: true },
		{ key: 'from', label: 'From' },
		{ key: 'subject', label: 'Subject' },
		{ key: 'actions', label: '' }
	];
</script>

<section class="flex flex-col gap-4">
	<h2 class="font-display text-xl">Emails</h2>
	<RecordsTable
		label="Emails"
		{columns}
		rows={emails}
		keyOf={(email) => email.id}
		isCardsOnPhone
		emptyMessage="No emails filed yet. Ask your Claude to file the emails about this company from Gmail."
	>
		{#snippet cells(email)}
			<FiledEmailCells {email} />
		{/snippet}
	</RecordsTable>
</section>
