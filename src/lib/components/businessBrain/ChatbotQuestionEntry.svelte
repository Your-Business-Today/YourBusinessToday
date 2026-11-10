<script lang="ts">
	import ChatbotAnswerReported from './ChatbotAnswerReported.svelte';
	import ChatbotReadingLine from './ChatbotReadingLine.svelte';
	import { whenOnUkClock } from '$lib/data/businessBrainChatbotTrailWording';
	import type { BusinessBrainAddresses } from '$lib/data/businessBrainAddresses';
	import type { ChatbotQuestionRecord } from '$lib/server/businessBrain/readChatbotQuestionTrail';

	let { question, addresses }: { question: ChatbotQuestionRecord; addresses: BusinessBrainAddresses } = $props();

	const askedAt = $derived(whenOnUkClock(question.askedAt));
</script>

<li class="flex min-w-0 flex-col gap-3 px-6 py-4">
	<p class="flex flex-wrap gap-x-2 text-xs text-chalk-subtle">
		<span class="break-all">{question.askedByEmail}</span>
		<span>{askedAt}</span>
	</p>
	<p class="whitespace-pre-line break-words font-display text-chalk">{question.question}</p>
	<ul class="flex flex-col gap-2" aria-label="What was read for it">
		{#each question.readings as reading, readingIndex (readingIndex)}
			<ChatbotReadingLine {reading} {addresses} />
		{:else}
			<li class="text-xs text-chalk-subtle">Nothing was read for it.</li>
		{/each}
	</ul>
	<ChatbotAnswerReported {question} />
</li>
