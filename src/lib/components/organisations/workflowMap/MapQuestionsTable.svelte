<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { mapQuestionKindNames, type MapQuestion } from '$lib/data/workflowMap/mapQuestions';
	import { questionWords } from './workflowMapWords';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	type QuestionRow = MapQuestion & { position: number };

	let { questions, onChooseStation }: { questions: MapQuestion[]; onChooseStation: (stationKey: string) => void } = $props();

	const rows: QuestionRow[] = $derived(questions.map((question, position) => ({ ...question, position })));

	const columns: RecordsColumn<QuestionRow>[] = [
		{ key: 'question', label: questionWords.question },
		{ key: 'about', label: questionWords.about, sortValue: (row) => row.stationName ?? '' },
		{ key: 'line', label: questionWords.line, sortValue: (row) => row.lineName ?? '' },
		{ key: 'kind', label: questionWords.kind, sortValue: (row) => mapQuestionKindNames[row.kind] }
	];

	function openStation({ stationKey }: QuestionRow): void {
		if (stationKey === null) return;
		onChooseStation(stationKey);
	}
</script>

<RecordsTable label={questionWords.label} {columns} {rows} keyOf={(row) => String(row.position)} onOpen={openStation} isCardsOnPhone emptyMessage={questionWords.noQuestions}>
	{#snippet cells(row)}
		<RecordsCell>{row.question}</RecordsCell>
		<RecordsCell label={questionWords.about}>{row.stationName ?? questionWords.wholeMap}</RecordsCell>
		<RecordsCell label={questionWords.line}>{row.lineName ?? questionWords.wholeMap}</RecordsCell>
		<RecordsCell label={questionWords.kind}>{mapQuestionKindNames[row.kind]}</RecordsCell>
	{/snippet}
</RecordsTable>
