<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import DecisionAnswerForm from './DecisionAnswerForm.svelte';
	import DecisionAnswerEntry from './DecisionAnswerEntry.svelte';
	import { decisionStandingBadges } from './decisionBadges';
	import type { ItemDecisionView } from '$lib/data/boardDecisionViews';

	let { decision, itemNumber }: { decision: ItemDecisionView; itemNumber: number } = $props();

	const standing = $derived(decisionStandingBadges[decision.standing]);
	const answers = $derived(decision.answers);
</script>

<section class="flex flex-col gap-2 border-l-2 border-go pl-3" aria-label="The decision">
	<div class="flex flex-wrap items-center gap-2">
		<p class="text-sm font-medium text-chalk">Put to the directors</p>
		<Badge label={standing.label} tone={standing.tone} />
	</div>
	<p class="text-sm break-words whitespace-pre-wrap text-chalk">“{decision.wording}”</p>
	{#if decision.replacesDecisionId !== null}
		<p class="text-xs break-words text-chalk-subtle">It replaces the earlier decision {decision.replacesDecisionId}, if it carries.</p>
	{/if}
	<p class="text-xs break-words text-chalk-subtle">{decision.ruleWords}</p>
	{#if answers.length > 0}
		<ul class="flex flex-col gap-2">
			{#each answers as answer (answer.directorName)}
				<DecisionAnswerEntry {answer} />
			{/each}
		</ul>
	{/if}
	<p class="text-xs break-words text-chalk-subtle">{decision.standingWords}</p>
	{#if decision.canAnswer}
		<DecisionAnswerForm {itemNumber} />
	{/if}
</section>
