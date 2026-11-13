<script lang="ts">
	import RecordsCell from '$lib/components/workspace/RecordsCell.svelte';
	import RecordsTable from '$lib/components/workspace/RecordsTable.svelte';
	import { domainQuestionHref, domainQuestionWords } from './domainQuestionWords';
	import { domainQuestionKindNames, type DomainQuestion } from '$lib/data/domainQuestions';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { RecordsColumn } from '$lib/components/workspace/recordsTable';

	type QuestionRow = DomainQuestion & { position: number };

	let { questions, addresses }: { questions: DomainQuestion[]; addresses: BusinessBrainAddresses } = $props();

	const rows: QuestionRow[] = $derived(questions.map((question, position) => ({ ...question, position })));
	const areaOf = (row: QuestionRow) => row.areaTitle ?? domainQuestionWords.onTheMap;

	const columns: RecordsColumn<QuestionRow>[] = [
		{ key: 'question', label: domainQuestionWords.question },
		{ key: 'about', label: domainQuestionWords.about, sortValue: (row) => row.about },
		{ key: 'area', label: domainQuestionWords.area, isWideOnly: true, sortValue: areaOf },
		{ key: 'kind', label: domainQuestionWords.kind, sortValue: (row) => domainQuestionKindNames[row.kind] }
	];
</script>

<RecordsTable label={domainQuestionWords.label} {columns} {rows} keyOf={(row) => String(row.position)} isCardsOnPhone emptyMessage={domainQuestionWords.noQuestions}>
	{#snippet cells(row)}
		<RecordsCell>{row.question}</RecordsCell>
		<RecordsCell label={domainQuestionWords.about} href={domainQuestionHref(row, addresses)}>{row.about}</RecordsCell>
		<RecordsCell isWideOnly>{areaOf(row)}</RecordsCell>
		<RecordsCell label={domainQuestionWords.kind}>{domainQuestionKindNames[row.kind]}</RecordsCell>
	{/snippet}
</RecordsTable>
