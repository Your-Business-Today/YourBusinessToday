<script lang="ts">
	import { citedButNeverGiven, citedPageNames, whenOnUkClock } from '$lib/data/businessBrainChatbotTrailWording';
	import type { ChatbotQuestionRecord } from '$lib/server/businessBrain/readChatbotQuestionTrail';

	let { question }: { question: ChatbotQuestionRecord } = $props();

	const listSeparator = '; ';
	const answer = $derived(question.answer);
	const cited = $derived(citedPageNames(question));
	const neverGiven = $derived(citedButNeverGiven(question));
	const hasCited = $derived(cited.length > 0);
	const hasNeverGiven = $derived(neverGiven.length > 0);
</script>

{#if answer === null}
	<p class="text-xs text-chalk-subtle">No answer recorded. The person’s Claude never reported one.</p>
{:else}
	<div class="flex min-w-0 flex-col gap-1 border-l-2 border-hairline pl-3">
		<p class="break-words text-xs text-chalk-subtle">
			Answer reported by {answer.answeredByEmail}’s Claude · {whenOnUkClock(answer.answeredAt)}
		</p>
		<p class="whitespace-pre-line break-words text-sm text-chalk">{answer.answer}</p>
		{#if hasCited}
			<p class="break-words text-xs text-chalk-subtle">Cited: {cited.join(listSeparator)}</p>
		{/if}
		{#if hasNeverGiven}
			<p class="break-words text-xs text-signal">Cited, but no reading for this question gave it back: {neverGiven.join(listSeparator)}</p>
		{/if}
	</div>
{/if}
