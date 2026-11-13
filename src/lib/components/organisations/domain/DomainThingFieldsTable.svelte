<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import type { DomainFieldFact } from '$lib/data/businessBrainDomain';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	let { fields, thingTitles }: { fields: DomainFieldFact[]; thingTitles: Map<string, string> } = $props();

	const holdsOf = (field: DomainFieldFact) => (field.ref === null ? field.type : (thingTitles.get(field.ref) ?? field.ref));

	const requiredWords = { yes: 'Always', no: 'Sometimes' };

	const columns: RecordsColumn<DomainFieldFact>[] = [
		{ key: 'field', label: 'Field' },
		{ key: 'holds', label: 'Holds' },
		{ key: 'required', label: 'Filled in', isWideOnly: true },
		{ key: 'notes', label: 'Notes', isWideOnly: true }
	];
</script>

<RecordsTable label="Fields" {columns} rows={fields} keyOf={(field) => field.name} isDense isCardsOnPhone emptyMessage="No fields are filed for it.">
	{#snippet cells(field)}
		<RecordsCell kind="link">{field.label}</RecordsCell>
		<RecordsCell label="Holds">{holdsOf(field)}</RecordsCell>
		<RecordsCell isWideOnly>{field.isRequired ? requiredWords.yes : requiredWords.no}</RecordsCell>
		<RecordsCell isWideOnly>{field.notes}</RecordsCell>
	{/snippet}
</RecordsTable>
