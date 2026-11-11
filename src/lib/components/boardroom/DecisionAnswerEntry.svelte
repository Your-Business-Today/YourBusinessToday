<script lang="ts">
	import DirectorAnswerEntry from './DirectorAnswerEntry.svelte';
	import { decisionAnswerBadges } from './decisionBadges';
	import type { DecisionAnswerView } from '$lib/data/boardDecisionViews';

	let { answer }: { answer: DecisionAnswerView } = $props();

	const badge = $derived(decisionAnswerBadges[answer.answer]);
</script>

<DirectorAnswerEntry directorName={answer.directorName} {badge} when={answer.when} words={answer.reason} />
