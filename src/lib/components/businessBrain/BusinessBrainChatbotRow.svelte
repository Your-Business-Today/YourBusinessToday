<script lang="ts">
	import Badge from '$lib/components/site/Badge.svelte';
	import { businessBrainPartNames } from '$lib/data/businessBrainRules';
	import { partBadgeTones } from './businessBrainIndex';
	import { peopleCountSentence } from './businessBrainSentences';
	import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';

	let { chatbot, questionsHref }: { chatbot: BusinessBrainChatbot; questionsHref: string | null } = $props();

	const { name, purpose, parts, people } = $derived(chatbot);
	const isPurposeGiven = $derived(purpose !== '');
</script>

<li class="flex flex-col gap-2 px-6 py-3">
	<div class="flex flex-wrap items-baseline justify-between gap-2">
		<span class="font-display text-chalk">{name}</span>
		<span class="text-xs text-chalk-subtle">{peopleCountSentence(people.length)}</span>
	</div>
	{#if isPurposeGiven}
		<p class="text-sm text-chalk-muted">{purpose}</p>
	{:else}
		<p class="text-sm text-chalk-subtle">No purpose given yet.</p>
	{/if}
	<div class="flex flex-wrap gap-1.5" aria-label={`What ${name} may read`}>
		{#each parts as part (part)}
			<Badge label={businessBrainPartNames[part]} tone={partBadgeTones[part]} />
		{:else}
			<span class="text-xs text-chalk-subtle">Reads nothing yet.</span>
		{/each}
	</div>
	{#if questionsHref !== null}
		<a href={questionsHref} class="self-start text-sm text-go underline underline-offset-2">Questions asked</a>
	{/if}
</li>
