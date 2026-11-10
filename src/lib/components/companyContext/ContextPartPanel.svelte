<script lang="ts">
	import ContextPartLinkList from './ContextPartLinkList.svelte';
	import ContextPartReviewForm from './ContextPartReviewForm.svelte';
	import ContextProcessStepList from './ContextProcessStepList.svelte';
	import DashboardPanel from '$lib/components/workspace/DashboardPanel.svelte';
	import { checkedSentence, confidenceSentence, seenSentence } from '$lib/data/companyContext/partSentences';
	import { partPlacement } from '$lib/data/companyContext/partPlacement';
	import type { CompanyContextVersion, ContextPart } from '$lib/data/companyContext/companyContext';

	let {
		part,
		context,
		canMark,
		onSelect
	}: {
		part: ContextPart;
		context: CompanyContextVersion;
		canMark: boolean;
		onSelect: (partKey: string) => void;
	} = $props();

	const steps = $derived(context.steps.filter((step) => step.processKey === part.key));
	const facts = $derived([seenSentence(part.seenIn), confidenceSentence(part), checkedSentence(part)]);
</script>

<DashboardPanel title={part.name}>
	<div class="flex flex-col gap-4 px-4 py-4 text-sm">
		<p class="text-chalk/50">{partPlacement(context, part)}</p>
		{#if part.description !== null}
			<p class="text-chalk/80">{part.description}</p>
		{/if}
		<ul class="flex flex-col gap-1 text-chalk/70" aria-label="Where it was seen, how sure Claude is and whether it is checked">
			{#each facts as fact (fact)}
				<li>{fact}</li>
			{/each}
		</ul>
		{#if steps.length > 0}
			<ContextProcessStepList {steps} {context} {onSelect} />
		{/if}
		<ContextPartLinkList partKey={part.key} {context} {onSelect} />
		{#if canMark}
			{#key part.key}
				<ContextPartReviewForm {part} versionNumber={context.versionNumber} />
			{/key}
		{/if}
	</div>
</DashboardPanel>
