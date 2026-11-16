<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { feeWords, leadQuoteColumns } from './leadQuoteWords';
	import type { LeadQuoteLine } from '$lib/data/leadQuoteRules';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	type NumberedLine = LeadQuoteLine & { position: number };

	let { lines }: { lines: LeadQuoteLine[] } = $props();

	const numberedLines = $derived(lines.map((line, index) => ({ ...line, position: index + 1 })));

	const columns: RecordsColumn<NumberedLine>[] = [
		{ key: 'stage', label: leadQuoteColumns.stage },
		{ key: 'delivers', label: leadQuoteColumns.delivers },
		{ key: 'timing', label: leadQuoteColumns.timing },
		{ key: 'fee', label: leadQuoteColumns.fee, isFigure: true }
	];
</script>

<RecordsTable label="The plan going forwards, a stage at a time" {columns} rows={numberedLines} keyOf={(line) => String(line.position)} isCardsOnPhone>
	{#snippet cells(line)}
		<RecordsCell><span class="font-medium">{line.position}. {line.name}</span></RecordsCell>
		<RecordsCell label={leadQuoteColumns.delivers}>{line.delivers}</RecordsCell>
		<RecordsCell label={leadQuoteColumns.timing}>{line.timing}</RecordsCell>
		<RecordsCell label={leadQuoteColumns.fee} kind="figure">{feeWords(line)}</RecordsCell>
	{/snippet}
</RecordsTable>
